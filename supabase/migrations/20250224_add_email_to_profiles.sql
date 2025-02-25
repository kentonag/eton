-- Add email column to profiles table
alter table profiles
add column if not exists email text;

-- Update existing profiles with email from auth.users
update profiles
set email = (
  select email
  from auth.users
  where auth.users.id = profiles.id
)
where email is null;
