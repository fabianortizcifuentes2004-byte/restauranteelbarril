-- =====================================================================
--  CONFIGURACIÓN DE SUPABASE PARA LA APP DE RESTAURANTE
--  Cómo usarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menú lateral  ->  SQL Editor  ->  New query
--   3. Pega TODO este archivo y presiona "Run"
-- =====================================================================

-- Tabla única tipo "clave -> valor" donde la app guarda todo su estado
-- (configuración, productos, inventario, órdenes, contabilidad, etc.)
create table if not exists public.app_state (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

-- Habilitar seguridad a nivel de fila
alter table public.app_state enable row level security;

-- Políticas: como la app usa un login interno (no Supabase Auth),
-- permitimos acceso con la clave pública "anon". Es el modelo típico
-- para una herramienta interna. (Más abajo: cómo endurecer la seguridad.)
drop policy if exists "anon_select" on public.app_state;
drop policy if exists "anon_insert" on public.app_state;
drop policy if exists "anon_update" on public.app_state;
drop policy if exists "anon_delete" on public.app_state;

create policy "anon_select" on public.app_state
  for select using (true);
create policy "anon_insert" on public.app_state
  for insert with check (true);
create policy "anon_update" on public.app_state
  for update using (true) with check (true);
create policy "anon_delete" on public.app_state
  for delete using (true);

-- Activar replicación en tiempo real para esta tabla
-- (para que los cambios se vean al instante en todos los dispositivos)
alter publication supabase_realtime add table public.app_state;

-- Listo. La app creará automáticamente los datos de ejemplo
-- la primera vez que alguien la abra.
