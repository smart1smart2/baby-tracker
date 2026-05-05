# Database tests

Postgres-level regression tests using [pgTAP](https://pgtap.org/), runnable
through the Supabase CLI's `supabase test db` command.

## Run locally

```bash
brew install supabase/tap/supabase
supabase start                  # boots local Postgres + Studio + Auth + …
supabase db reset               # applies every migration in supabase/migrations
supabase test db                # runs every *.test.sql in supabase/tests
```

`rls.test.sql` re-enables RLS (the dev-mode migration leaves it off for app
ergonomics) and asserts that a parent in one family cannot read or write
another family's child data. The whole test runs inside a transaction and
rolls back, so it doesn't pollute the local database.
