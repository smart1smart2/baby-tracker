-- Enable pgvector for semantic search.
-- gte-small produces 384-dimensional embeddings via Supabase AI.
create extension if not exists vector;

create table public.articles (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  body           text not null,
  category       text not null,
  age_min_months int  not null default 0,
  age_max_months int  not null default 36,
  embedding      vector(384),
  created_at     timestamptz not null default now()
);

-- IVFFlat index for approximate nearest-neighbour search.
-- 20 lists is appropriate for <1 000 rows; increase for larger corpora.
create index articles_embedding_idx on public.articles
  using ivfflat (embedding vector_cosine_ops) with (lists = 20);

alter table public.articles enable row level security;
create policy "articles_authenticated_read" on public.articles
  for select using (auth.uid() is not null);

-- Semantic search: returns rows ranked by cosine similarity to the
-- query embedding, optionally filtered by child age.
create or replace function public.match_articles(
  query_embedding vector(384),
  match_count     int     default 3,
  p_age_months    int     default null
)
returns table (
  id         uuid,
  title      text,
  body       text,
  category   text,
  similarity float
)
language sql stable
as $$
  select id, title, body, category,
    1 - (embedding <=> query_embedding) as similarity
  from public.articles
  where embedding is not null
    and (
      p_age_months is null
      or (age_min_months <= p_age_months and age_max_months >= p_age_months)
    )
  order by embedding <=> query_embedding
  limit match_count;
$$;
