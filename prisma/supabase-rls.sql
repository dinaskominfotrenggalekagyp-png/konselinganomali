-- Hardening Supabase untuk aplikasi ini.
--
-- Aplikasi mengakses database lewat Prisma memakai role `postgres` (owner),
-- jadi RLS TIDAK mengganggu query aplikasi. Namun Supabase otomatis
-- mengekspos tabel `public` ke PostgREST (REST API) untuk role `anon` dan
-- `authenticated`. Karena auth aplikasi ini memakai JWT sendiri (bukan
-- Supabase Auth), tabel tidak boleh bisa diakses lewat anon key.
--
-- Jalankan setelah skema dibuat:
--   npm run db:rls
--
-- Aman dijalankan berulang.

do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end
$$;

-- Cabut akses default PostgREST untuk anon & authenticated.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Pastikan akses berikutnya (tabel baru) juga tertutup.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
