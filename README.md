# Restaurante — App web con Supabase + Cloudflare Pages

Aplicación de gestión de restaurante (cocinero, mesero, administrador) con
datos compartidos en la nube en tiempo real. Gratis usando **Supabase**
(base de datos) y **Cloudflare Pages** (hosting).

No necesitas saber programar para desplegarla: solo seguir estos pasos.

---

## Qué necesitas

- Una cuenta de **GitHub** (gratis) — github.com
- Una cuenta de **Supabase** (gratis) — supabase.com
- Una cuenta de **Cloudflare** (gratis) — dash.cloudflare.com

---

## Paso 1 — Crear el proyecto en Supabase

1. Entra a supabase.com e inicia sesión.
2. Botón **New project**. Ponle un nombre (ej. `restaurante`), define una
   contraseña de base de datos (guárdala) y elige la región más cercana
   (South America si está disponible).
3. Espera ~2 minutos a que el proyecto quede listo.

## Paso 2 — Crear la tabla (ejecutar el SQL)

1. En el menú lateral de Supabase: **SQL Editor** → **New query**.
2. Abre el archivo `supabase_schema.sql` de este proyecto, copia **todo**
   su contenido y pégalo.
3. Presiona **Run**. Debe decir "Success".

## Paso 3 — Obtener las claves

1. En Supabase: **Project Settings** (engranaje) → **API**.
2. Copia estos dos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (una clave larga)
3. Guárdalos, los usarás en el Paso 5 y 6.

## Paso 4 — (Opcional) Probarla en tu computador

Solo si tienes Node.js instalado. Si no, salta al Paso 5.

```bash
npm install
cp .env.example .env
# edita .env y pega tu URL y tu clave anon
npm run dev
```

Abre la dirección que aparece (ej. `http://localhost:5173`).
Cuentas de prueba: `admin/admin`, `cocinero/cocinero`, `mesero/mesero`.

## Paso 5 — Subir el proyecto a GitHub

1. Crea un repositorio nuevo en github.com (puede ser privado).
2. Sube **todos los archivos de esta carpeta** al repositorio.
   (Si usas la web de GitHub: botón "Add file" → "Upload files" y arrastra
   todo. **No** subas las carpetas `node_modules` ni `dist` ni el archivo
   `.env` — el archivo `.gitignore` ya las excluye si usas Git.)

## Paso 6 — Publicar en Cloudflare Pages

1. Entra a dash.cloudflare.com → menú **Workers & Pages** → **Create** →
   pestaña **Pages** → **Connect to Git**.
2. Autoriza GitHub y elige tu repositorio.
3. En la configuración de build pon:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Antes de desplegar, abre **Environment variables (Variables y secretos)**
   y agrega estas dos (para Production):
   - `VITE_SUPABASE_URL` = tu Project URL del Paso 3
   - `VITE_SUPABASE_ANON_KEY` = tu clave anon del Paso 3
5. Botón **Save and Deploy**. En 1–2 minutos tendrás una dirección como
   `https://restaurante.pages.dev` que puedes abrir desde cualquier
   celular o computador. Todos verán los mismos datos.

Cada vez que actualices el código en GitHub, Cloudflare lo vuelve a
publicar automáticamente.

---

## Notas importantes

**Plan gratuito de Supabase:** si el proyecto pasa **una semana entera sin
ningún uso**, Supabase lo pausa y tarda ~30 segundos en reactivarse la
próxima vez. Un restaurante que se usa a diario nunca lo notará.

**Seguridad (importante):** la app usa un login interno simple y la clave
pública `anon`. Es el modelo habitual de una herramienta interna, pero
cualquiera con la dirección podría, técnicamente, leer/escribir datos.
Para un negocio real conviene endurecerlo más adelante con autenticación
de Supabase (correo + contraseña) y políticas por usuario. Puedo
prepararte esa versión cuando quieras.

**Respaldo:** dentro de la app, en Configuración → Respaldo, puedes
descargar una copia de todos los datos en un archivo. Hazlo de vez en
cuando.

**Cambiar las contraseñas:** entra como `admin/admin` y en
Configuración → Usuarios cambia las contraseñas por defecto.
