-- Create shares table
create table if not exists shares (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references articles(id) on delete cascade not null,
  platform text not null check (platform in ('twitter', 'facebook', 'linkedin', 'line', 'copy')),
  created_at timestamptz default now() not null
);

-- shares table RLS policies
alter table shares enable row level security;

create policy "Anyone can view share counts"
  on shares for select
  to authenticated, anon
  using (true);

create policy "Anyone can create shares"
  on shares for insert
  to authenticated, anon
  with check (true);

-- Create article_stats view
create or replace view article_stats as
select 
  a.id as article_id,
  count(distinct l.user_id) as like_count,
  count(distinct c.id) as comment_count,
  count(distinct s.id) as share_count,
  count(distinct s.id) filter (where s.platform = 'twitter') as twitter_shares,
  count(distinct s.id) filter (where s.platform = 'facebook') as facebook_shares,
  count(distinct s.id) filter (where s.platform = 'linkedin') as linkedin_shares,
  count(distinct s.id) filter (where s.platform = 'line') as line_shares,
  count(distinct s.id) filter (where s.platform = 'copy') as url_copies
from articles a
left join likes l on a.id = l.article_id
left join comments c on a.id = c.article_id
left join shares s on a.id = s.article_id
group by a.id;

-- Create popular_articles view
create or replace view popular_articles as
select 
  a.*,
  p.username as author_name,
  p.avatar_url as author_avatar,
  coalesce(s.like_count, 0) as like_count,
  coalesce(s.comment_count, 0) as comment_count,
  coalesce(s.share_count, 0) as share_count,
  coalesce(s.like_count, 0) + coalesce(s.comment_count, 0) * 2 + coalesce(s.share_count, 0) * 3 as engagement_score
from articles a
left join profiles p on a.user_id = p.id
left join article_stats s on a.id = s.article_id
where a.published = true
order by engagement_score desc, a.created_at desc;
