-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamptz
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create articles table
create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  excerpt text,
  published boolean default true,
  user_id uuid references auth.users not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table articles enable row level security;

create policy "Public articles are viewable by everyone."
  on articles for select
  using ( published = true );

create policy "Users can see their own drafts."
  on articles for select
  using ( auth.uid() = user_id );

create policy "Users can create articles."
  on articles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own articles."
  on articles for update
  using ( auth.uid() = user_id );

create policy "Users can delete own articles."
  on articles for delete
  using ( auth.uid() = user_id );

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references auth.users not null,
  article_id uuid references articles on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Users can create comments."
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own comments."
  on comments for update
  using ( auth.uid() = user_id );

create policy "Users can delete own comments."
  on comments for delete
  using ( auth.uid() = user_id );

-- Create tags table
create table tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamptz default now() not null
);

alter table tags enable row level security;

create policy "Tags are viewable by everyone."
  on tags for select
  using ( true );

create policy "Users can create tags."
  on tags for insert
  with check ( true );

-- Create article_tags table
create table article_tags (
  article_id uuid references articles on delete cascade not null,
  tag_id uuid references tags on delete cascade not null,
  primary key (article_id, tag_id)
);

alter table article_tags enable row level security;

create policy "Article tags are viewable by everyone."
  on article_tags for select
  using ( true );

create policy "Users can manage tags for their articles."
  on article_tags for insert
  with check (
    exists (
      select 1 from articles
      where id = article_id and user_id = auth.uid()
    )
  );

create policy "Users can remove tags from their articles."
  on article_tags for delete
  using (
    exists (
      select 1 from articles
      where id = article_id and user_id = auth.uid()
    )
  );

-- Create likes table
create table likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  article_id uuid references articles on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, article_id)
);

alter table likes enable row level security;

create policy "Likes are viewable by everyone."
  on likes for select
  using ( true );

create policy "Users can create likes."
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own likes."
  on likes for delete
  using ( auth.uid() = user_id );

-- Functions
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
