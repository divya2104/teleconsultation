-- ClearSight backend — core vertical slice
-- profiles · doctors · availability · appointments · triage_records
-- + RLS, RPCs (open_slots / book_appointment / submit_triage), storage.
-- Single-region MVP: clinic-local time is IST, pinned explicitly in open_slots.

-- ============================================================
-- Enums
-- ============================================================
create type user_role as enum ('patient', 'doctor', 'admin');
create type diabetes_status as enum ('yes', 'no', 'unknown');
create type verification_status as enum ('verified', 'pending', 'suspended');
create type appointment_status as enum ('upcoming', 'live', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('pending', 'paid', 'refunded');

-- ============================================================
-- Tables
-- ============================================================
create table profiles (
  id                uuid primary key references auth.users on delete cascade,
  role              user_role not null default 'patient',
  full_name         text,
  phone             text,
  email             text,
  diabetes          diabetes_status not null default 'unknown',
  notify_whatsapp   boolean not null default true,
  notify_sms        boolean not null default true,
  notify_email      boolean not null default false,
  created_at        timestamptz not null default now()
);

create table doctors (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid references profiles on delete set null,
  name                 text not null,
  specialty            text not null,
  languages            text[] not null default '{}',
  reg_no               text,
  bio                  text,
  photo_url            text,
  verification_status  verification_status not null default 'pending',
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);
create index doctors_profile_id_idx on doctors (profile_id);

create table availability (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references doctors on delete cascade,
  weekday     smallint not null check (weekday between 1 and 7),  -- ISO: 1=Mon .. 7=Sun
  start_time  time not null,
  end_time    time not null,
  check (end_time > start_time)
);
create index availability_doctor_id_idx on availability (doctor_id);

create table appointments (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references profiles on delete cascade,
  doctor_id       uuid not null references doctors on delete restrict,
  starts_at       timestamptz not null,
  reason          text,
  symptom         text,
  note            text,
  status          appointment_status not null default 'upcoming',
  payment_status  payment_status not null default 'pending',
  ref             text not null unique,
  created_at      timestamptz not null default now()
);
create index appointments_patient_id_idx on appointments (patient_id);
create index appointments_doctor_id_idx on appointments (doctor_id);
-- race guard: one non-cancelled booking per doctor per instant
create unique index appointments_slot_uniq
  on appointments (doctor_id, starts_at)
  where status <> 'cancelled';

create table triage_records (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null unique references appointments on delete cascade,
  answers         jsonb not null default '{}',
  acuity          jsonb not null default '{}',
  photo_paths     text[] not null default '{}',
  urgency         smallint not null default 0 check (urgency between 0 and 3),
  red_flags       text[] not null default '{}',
  submitted_at    timestamptz not null default now()
);

-- Scoring rules for submit_triage (mirrors QUESTIONS in src/lib/mock/intake.ts).
-- No RLS policy -> only reachable from the security-definer function.
create table triage_option_scores (
  value     text primary key,
  urgency   smallint not null default 0,
  red_flag  boolean not null default false,
  label     text not null
);
insert into triage_option_scores (value, urgency, red_flag, label) values
  ('today',       2, false, 'Today'),
  ('days',        1, false, 'In the last few days'),
  ('weeks',       0, false, 'Weeks ago'),
  ('months',      0, false, 'Months ago or longer'),
  ('blur',        1, false, 'Blurred vision'),
  ('redness',     1, false, 'Redness'),
  ('discharge',   0, false, 'Discharge or watering'),
  ('itching',     0, false, 'Itching'),
  ('pain',        1, false, 'Eye pain'),
  ('sudden_loss', 3, true,  'Sudden loss of vision'),
  ('flashes',     3, true,  'New flashes or floaters'),
  ('injury',      3, true,  'Recent eye injury or chemical splash'),
  ('halos',       3, true,  'Halos around lights with headache'),
  ('yes',         1, false, 'Wears contact lenses');

-- ============================================================
-- Auth glue
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Helpers
-- ============================================================
create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_doctor_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from doctors where profile_id = auth.uid();
$$;

-- ============================================================
-- open_slots: available start times for a doctor over the next N days
-- ============================================================
create or replace function open_slots(p_doctor_id uuid, p_days int default 14)
returns setof timestamptz
language sql stable
as $$
  with days as (
    select (current_date + g)::date as d
    from generate_series(0, greatest(coalesce(p_days, 14), 1) - 1) as g
  ),
  windows as (
    select d.d, a.start_time, a.end_time
    from days d
    join availability a
      on a.doctor_id = p_doctor_id
     and a.weekday = extract(isodow from d.d)::int
  ),
  candidates as (
    -- availability times are clinic-local wall-clock (IST); pin the tz here
    -- so results are correct regardless of the session timezone.
    select generate_series(
             (w.d + w.start_time) at time zone 'Asia/Kolkata',
             ((w.d + w.end_time) at time zone 'Asia/Kolkata') - interval '30 minutes',
             interval '30 minutes'
           ) as starts_at
    from windows w
  )
  select c.starts_at
  from candidates c
  where c.starts_at > now() + interval '30 minutes'
    and not exists (
      select 1 from appointments ap
      where ap.doctor_id = p_doctor_id
        and ap.starts_at = c.starts_at
        and ap.status <> 'cancelled'
    )
  order by c.starts_at;
$$;

-- ============================================================
-- book_appointment: slot-checked, race-safe insert for the caller
-- ============================================================
create or replace function book_appointment(
  p_doctor_id  uuid,
  p_starts_at  timestamptz,
  p_reason     text,
  p_symptom    text default null,
  p_note       text default null
)
returns appointments
language plpgsql
security definer set search_path = public
as $$
declare
  v_appt appointments;
  v_ref  text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from open_slots(p_doctor_id, 60) s where s = p_starts_at
  ) then
    raise exception 'slot not available' using errcode = 'P0001';
  end if;

  v_ref := 'CS-' || lpad((floor(random() * 1000000))::int::text, 6, '0');

  -- ponytail: payment is stubbed for the core slice, so mark paid on booking.
  -- A real PaymentGateway flips this to 'pending' + a capture step later.
  insert into appointments
    (patient_id, doctor_id, starts_at, reason, symptom, note, payment_status, ref)
  values
    (auth.uid(), p_doctor_id, p_starts_at, p_reason, p_symptom, p_note, 'paid', v_ref)
  returning * into v_appt;

  return v_appt;
exception
  when unique_violation then
    raise exception 'slot not available' using errcode = 'P0001';
end;
$$;

-- ============================================================
-- submit_triage: server-computed urgency, upsert on appointment
-- ============================================================
create or replace function submit_triage(
  p_appointment_id  uuid,
  p_answers         jsonb,
  p_acuity          jsonb default '{}',
  p_photo_paths     text[] default '{}'
)
returns triage_records
language plpgsql
security definer set search_path = public
as $$
declare
  v_rec       triage_records;
  v_score     int;
  v_red_flags text[];
  v_urgency   int;
begin
  if not exists (
    select 1 from appointments a
    where a.id = p_appointment_id and a.patient_id = auth.uid()
  ) then
    raise exception 'appointment not found' using errcode = 'P0001';
  end if;

  with picked as (
    select jsonb_array_elements_text(
             case jsonb_typeof(v.value)
               when 'array' then v.value
               else jsonb_build_array(v.value)
             end
           ) as val
    from jsonb_each(coalesce(p_answers, '{}'::jsonb)) as v
    where jsonb_typeof(v.value) in ('array', 'string')
  )
  select coalesce(sum(s.urgency), 0),
         coalesce(array_agg(s.label) filter (where s.red_flag), '{}')
  into v_score, v_red_flags
  from picked p
  join triage_option_scores s on s.value = p.val;

  v_urgency := case
    when coalesce(array_length(v_red_flags, 1), 0) > 0 then 3
    when v_score >= 3 then 2
    when v_score >= 1 then 1
    else 0
  end;

  insert into triage_records
    (appointment_id, answers, acuity, photo_paths, urgency, red_flags)
  values
    (p_appointment_id, coalesce(p_answers, '{}'::jsonb), coalesce(p_acuity, '{}'::jsonb),
     coalesce(p_photo_paths, '{}'), v_urgency, v_red_flags)
  on conflict (appointment_id) do update set
    answers      = excluded.answers,
    acuity       = excluded.acuity,
    photo_paths  = excluded.photo_paths,
    urgency      = excluded.urgency,
    red_flags    = excluded.red_flags,
    submitted_at = now()
  returning * into v_rec;

  return v_rec;
end;
$$;

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles              enable row level security;
alter table doctors               enable row level security;
alter table availability          enable row level security;
alter table appointments          enable row level security;
alter table triage_records        enable row level security;
alter table triage_option_scores  enable row level security;  -- deny-all to clients

-- profiles
create policy "profiles: read own or admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles: assigned doctor reads patient" on profiles
  for select using (
    exists (
      select 1 from appointments a
      where a.patient_id = profiles.id and a.doctor_id = my_doctor_id()
    )
  );
create policy "profiles: update own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- doctors
create policy "doctors: read active or self or admin" on doctors
  for select using (
    (active and verification_status = 'verified')
    or profile_id = auth.uid()
    or is_admin()
  );
create policy "doctors: apply as self" on doctors
  for insert with check (profile_id = auth.uid() and verification_status = 'pending');
create policy "doctors: manage self or admin" on doctors
  for update using (profile_id = auth.uid() or is_admin());

-- availability
create policy "availability: public read" on availability
  for select using (true);
create policy "availability: doctor writes own" on availability
  for all using (doctor_id = my_doctor_id() or is_admin())
  with check (doctor_id = my_doctor_id() or is_admin());

-- appointments  (inserts go through book_appointment; no insert policy)
create policy "appointments: read own party" on appointments
  for select using (
    patient_id = auth.uid() or doctor_id = my_doctor_id() or is_admin()
  );
create policy "appointments: update own party" on appointments
  for update using (
    patient_id = auth.uid() or doctor_id = my_doctor_id() or is_admin()
  );

-- triage_records  (writes go through submit_triage; no insert/update policy)
create policy "triage: read own party" on triage_records
  for select using (
    exists (
      select 1 from appointments a
      where a.id = appointment_id
        and (a.patient_id = auth.uid() or a.doctor_id = my_doctor_id())
    )
    or is_admin()
  );

-- ============================================================
-- Grants
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
revoke all on table triage_option_scores from anon, authenticated;

grant execute on function open_slots(uuid, int)        to anon, authenticated;
grant execute on function book_appointment(uuid, timestamptz, text, text, text) to authenticated;
grant execute on function submit_triage(uuid, jsonb, jsonb, text[]) to authenticated;
grant execute on function is_admin()                   to authenticated;
grant execute on function my_doctor_id()               to authenticated;

-- ============================================================
-- Storage: private bucket for guided-intake eye photos
-- Path convention: {appointment_id}/{n}.jpg
-- ============================================================
insert into storage.buckets (id, name, public)
values ('intake-photos', 'intake-photos', false)
on conflict (id) do nothing;

create policy "intake-photos: patient writes own appointment" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'intake-photos'
    and (storage.foldername(name))[1] in (
      select id::text from appointments where patient_id = auth.uid()
    )
  );

create policy "intake-photos: party reads" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'intake-photos'
    and (storage.foldername(name))[1] in (
      select a.id::text from appointments a
      where a.patient_id = auth.uid() or a.doctor_id = my_doctor_id()
    )
  );
