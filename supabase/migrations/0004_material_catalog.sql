-- Katalog materi HTML5 daring (ADR-0035, kontrak bundel v1 §6 dan §11).
-- Baris ditulis hanya oleh Worker dengan service_role; perangkat membaca lewat
-- /v1/materials, tidak pernah lewat PostgREST anonim.
create table if not exists public.materials (
  material_id text not null,
  version text not null,
  schema_version text not null default '1.0.0',
  title text not null,
  summary text not null,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'approved')),
  grade_levels integer[] not null,
  subjects text[] not null,
  manifest jsonb not null,
  bundle_path text not null,
  cover_path text,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 52428800),
  bundle_sha256 text not null check (bundle_sha256 ~ '^[0-9a-f]{64}$'),
  key_id text,
  signature text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unpublished_at timestamptz,
  primary key (material_id, version),
  -- §11.6: satu versi tidak boleh terbit ulang dengan isi berbeda; naikan versi.
  check (schema_version like '1%')
);

-- Halaman katalog diurut publishedAt menurun lalu materialId (§6).
create index if not exists materials_catalog_order
  on public.materials (published_at desc, material_id);

create index if not exists materials_grade_levels
  on public.materials using gin (grade_levels);

create index if not exists materials_subjects
  on public.materials using gin (subjects);

alter table public.materials enable row level security;

-- Tanpa policy untuk anon/authenticated: katalog dinikmati lewat Worker, dan
-- draf tidak boleh terlihat dari sisi mana pun selain Worker admin (OD-10).
drop policy if exists "materials service role only" on public.materials;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.materials to service_role;
