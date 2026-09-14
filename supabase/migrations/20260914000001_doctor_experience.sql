-- Years of clinical experience, shown on the doctor picker.
alter table doctors add column if not exists years_experience smallint
  check (years_experience is null or years_experience between 0 and 70);

-- Seeded demo doctors (ids from seed.sql); no-op on databases without them.
update doctors set years_experience = v.y
from (values
  ('11111111-0000-4000-8000-000000000001'::uuid, 18),
  ('11111111-0000-4000-8000-000000000002'::uuid, 12),
  ('11111111-0000-4000-8000-000000000003'::uuid, 22),
  ('11111111-0000-4000-8000-000000000004'::uuid, 9),
  ('11111111-0000-4000-8000-000000000005'::uuid, 15),
  ('11111111-0000-4000-8000-000000000006'::uuid, 7)
) as v(id, y)
where doctors.id = v.id and doctors.years_experience is null;
