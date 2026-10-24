-- Gerbang Edukasi — skema backend Supabase (OD-7)
-- Dijalankan lewat Supabase CLI: supabase db push
-- Semua tabel dilindungi RLS tanpa policy publik; akses hanya lewat
-- service role (Cloudflare Worker). Jangan memakai service key di klien.

create extension if not exists pgcrypto;

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  label text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table public.enrollment_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null,
  label text,
  max_uses integer not null default 1 check (max_uses >= 1),
  used_count integer not null default 0 check (used_count >= 0 and used_count <= max_uses),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sync_events (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id),
  event_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (device_id, event_id)
);

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  serial_hash text unique not null,
  product_id text not null,
  license_type text not null check (license_type in ('subscription', 'perpetual')),
  machine_id uuid,
  status text not null default 'issued'
    check (status in ('issued', 'active', 'revoked', 'expired')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  activated_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.license_audit (
  id bigint generated always as identity primary key,
  license_id uuid references public.licenses(id),
  action text not null,
  machine_id uuid,
  actor text,
  created_at timestamptz not null default now()
);

create table public.admin_roles (
  user_id uuid primary key,
  role text not null check (role in ('viewer', 'reviewer', 'publisher', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.devices enable row level security;
alter table public.enrollment_codes enable row level security;
alter table public.sync_events enable row level security;
alter table public.licenses enable row level security;
alter table public.license_audit enable row level security;
alter table public.admin_roles enable row level security;

-- Tidak ada policy untuk anon/authenticated: akses hanya lewat service role.
-- Bila admin memakai Supabase Auth, tambahkan policy berbasis admin_roles.

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

create index idx_sync_events_device on public.sync_events(device_id, received_at desc);
create index idx_license_audit_license on public.license_audit(license_id, created_at desc);
create index idx_enrollment_codes_hash on public.enrollment_codes(code_hash);
