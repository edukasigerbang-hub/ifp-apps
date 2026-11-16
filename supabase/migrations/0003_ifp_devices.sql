-- Pisahkan perangkat IFP dari tabel `devices` milik Fanakon.
-- Project Supabase dipakai bersama; `devices` sudah ada sebelum migrasi Gerbang
-- sehingga tidak pernah dibuat sesuai skema Gerbang.
create table if not exists public.ifp_devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  license_id uuid references public.licenses (id) on delete cascade,
  platform text not null check (platform in ('android', 'windows')),
  label text,
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'revoked')),
  activated_at timestamptz,
  owner_id uuid references auth.users (id) on delete cascade,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ifp_devices enable row level security;

drop policy if exists "ifp_devices owner select" on public.ifp_devices;
create policy "ifp_devices owner select" on public.ifp_devices for select
  using (owner_id = auth.uid());

drop policy if exists "ifp_devices owner insert" on public.ifp_devices;
create policy "ifp_devices owner insert" on public.ifp_devices for insert
  with check (owner_id = auth.uid());

grant select, insert, update on public.ifp_devices to authenticated;
grant all on public.ifp_devices to service_role;

-- Event sinkronisasi harus merujuk perangkat IFP, bukan perangkat Fanakon.
-- Aman selama sync_events masih kosong.
alter table public.sync_events drop constraint if exists sync_events_device_id_fkey;
alter table public.sync_events
  add constraint sync_events_device_id_fkey
  foreign key (device_id) references public.ifp_devices (device_id) on delete cascade;
