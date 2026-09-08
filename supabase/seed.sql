-- ClearSight seed — local dev / demo data.
-- Runs after migrations on `supabase db reset`.

-- ------------------------------------------------------------
-- Demo auth users (email OTP: no password needed, but we set one
-- so they also work with password sign-in if you want it).
-- The handle_new_user trigger creates the matching profiles row.
-- ------------------------------------------------------------
-- GoTrue scans confirmation_token / recovery_token / email_change /
-- email_change_token_new as non-null strings — seed them as '' or every
-- auth query 500s with "Database error finding user".
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
values
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'doctor@clearsight.test',
   extensions.crypt('password', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dr. Anand Rao"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'admin@clearsight.test',
   extensions.crypt('password', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Ops Admin"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

update profiles set role = 'doctor' where email = 'doctor@clearsight.test';
update profiles set role = 'admin'  where email = 'admin@clearsight.test';

-- ------------------------------------------------------------
-- Doctors  (mirrors src/lib/mock/doctors.ts)
-- ------------------------------------------------------------
insert into doctors (id, profile_id, name, specialty, languages, reg_no, bio, verification_status, active) values
  ('11111111-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-000000000001',
   'Dr. Anand Rao', 'General ophthalmology', '{English,Hindi,Kannada}', 'KMC/12345',
   '18 years in comprehensive eye care. Special interest in dry eye and anterior segment.',
   'verified', true),
  ('11111111-0000-4000-8000-000000000002', null,
   'Dr. Meera Iyer', 'Cornea & refractive', '{English,Tamil,Hindi}', 'TNMC/54321',
   'Cornea specialist. Sees a high volume of contact-lens and refractive concerns.',
   'verified', true),
  ('11111111-0000-4000-8000-000000000003', null,
   'Dr. Sana Qureshi', 'Glaucoma & general', '{English,Hindi,Urdu}', 'MMC/98765',
   'Glaucoma and general ophthalmology. Focus on early detection and long-term follow-up.',
   'verified', true),
  ('11111111-0000-4000-8000-000000000004', null,
   'Dr. Raj Patel', 'Paediatric ophthalmology', '{English,Gujarati,Hindi}', 'GMC/44556',
   'Paediatric eye care — squint, amblyopia and childhood refractive problems.',
   'verified', true),
  ('11111111-0000-4000-8000-000000000005', null,
   'Dr. Priya Sharma', 'Retina & vitreous', '{English,Hindi,Punjabi}', 'PMC/77889',
   'Medical and surgical retina, with a focus on diabetic eye disease.',
   'verified', true),
  ('11111111-0000-4000-8000-000000000006', null,
   'Dr. Vikram Singh', 'Oculoplastics', '{English,Hindi}', 'DMC/33221',
   'Eyelid, tear-duct and orbit surgery; also sees general adult eye complaints.',
   'verified', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Weekly availability (mirrors defaultAvailability in src/lib/mock/doctor.ts)
-- weekday: ISO 1=Mon .. 7=Sun
-- ------------------------------------------------------------
insert into availability (doctor_id, weekday, start_time, end_time)
select d.id, w.weekday, w.start_time, w.end_time
from doctors d
cross join (values
  (1, time '10:00', time '13:00'),
  (1, time '15:00', time '18:00'),
  (2, time '10:00', time '13:00'),
  (3, time '15:00', time '18:00'),
  (4, time '10:00', time '13:00'),
  (4, time '15:00', time '18:00'),
  (5, time '10:00', time '13:00')
) as w(weekday, start_time, end_time)
where not exists (
  select 1 from availability a
  where a.doctor_id = d.id and a.weekday = w.weekday and a.start_time = w.start_time
);
