-- Gerbang Edukasi — migrasi aditif untuk backend aplikasi (OD-7)
--
-- PENTING: repo `web` sudah memiliki `supabase/migrations/0001_init.sql`
-- (profiles, licenses, devices, activations, partners, content, orders).
-- Jalankan migrasi ini SETELAH 0001 tersebut pada project Supabase yang sama.
-- Migrasi ini tidak membuat ulang tabel yang sudah ada.

create extension if not exists pgcrypto;

-- Kode enrollment (hash) untuk mengikat perangkat tanpa akun pengguna.
create table if not exists public.enrollment_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null,
  label text,
  max_uses integer not null default 1 check (max_uses >= 1),
  used_count integer not null default 0 check (used_count >= 0 and used_count <= max_uses),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Kolom tambahan pada devices milik web (device_id text unik, platform wajib).
alter table public.devices add column if not exists last_seen_at timestamptz;

-- Event sinkronisasi hasil belajar; FK ke devices.device_id (text unik).
create table if not exists public.sync_events (
  id bigint generated always as identity primary key,
  device_id text not null references public.devices(device_id) on delete cascade,
  event_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (device_id, event_id)
);

-- Kolom tambahan pada licenses milik web (tanpa mengubah plan/status web).
alter table public.licenses add column if not exists serial_hash text unique;
alter table public.licenses add column if not exists product_id text;
alter table public.licenses add column if not exists license_type text
  check (license_type is null or license_type in ('subscription', 'perpetual'));
alter table public.licenses add column if not exists machine_id uuid;
alter table public.licenses add column if not exists key_id text;
alter table public.licenses add column if not exists activated_at timestamptz;

-- Audit aksi lisensi (aktivasi, transfer, deaktivasi, refresh).
create table if not exists public.license_audit (
  id bigint generated always as identity primary key,
  license_id uuid references public.licenses(id) on delete set null,
  action text not null,
  machine_id uuid,
  actor text,
  created_at timestamptz not null default now()
);

-- Peran admin berbasis Supabase Auth (RBAC untuk dashboard).
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer', 'reviewer', 'publisher', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.enrollment_codes enable row level security;
alter table public.sync_events enable row level security;
alter table public.license_audit enable row level security;
alter table public.admin_roles enable row level security;

-- Tidak ada policy publik: akses data hanya lewat service role (Cloudflare Worker).
-- Dashboard admin memakai Supabase Auth + policy berbasis admin_roles (increment berikutnya).

create or replace function public.consume_enrollment_code(p_code_hash text)
returns table (code_id uuid, allowed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.enrollment_codes%rowtype;
begin
  select * into v_code
  from public.enrollment_codes
  where code_hash = p_code_hash
  for update;

  if not found then
    return query select null::uuid, false;
    return;
  end if;

  if v_code.expires_at is not null and v_code.expires_at < now() then
    return query select v_code.id, false;
    return;
  end if;

  if v_code.used_count >= v_code.max_uses then
    return query select v_code.id, false;
    return;
  end if;

  update public.enrollment_codes
  set used_count = used_count + 1
  where id = v_code.id;

  return query select v_code.id, true;
end;
$$;

revoke all on function public.consume_enrollment_code(text) from public;

create index if not exists idx_sync_events_device on public.sync_events(device_id, received_at desc);
create index if not exists idx_license_audit_license on public.license_audit(license_id, created_at desc);
create index if not exists idx_enrollment_codes_hash on public.enrollment_codes(code_hash);
