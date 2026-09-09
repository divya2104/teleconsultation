-- Phone-OTP sign-ups: carry the phone number (and a sane full_name fallback)
-- from auth.users into the profiles row the trigger creates.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      new.phone
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
