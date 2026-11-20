# EFA Voley Club

Sitio web del club de voleibol **Eso Fue Adentro (EFA)**: noticias, convocatorias, galería e inscripciones.

## Stack

- Next.js 15 (App Router, `src/`) + React 19 + TypeScript
- Tailwind CSS v4 (tokens del club en `src/app/globals.css`)
- Supabase (Postgres + Auth) para datos
- Cloudflare R2 (compatible con S3) para imágenes (subida vía servidor + compresión en el cliente)
- Vitest + React Testing Library

## Cómo correr

```bash
npm install
cp .env.local.example .env.local   # y completar los valores
npm run dev                        # http://localhost:3000
```

Otros comandos: `npm run build`, `npm test`, `npm run lint`.

## Variables de entorno

Ver [`.env.local.example`](./.env.local.example) para la lista completa (Supabase, Cloudflare R2 y Resend). Las variables se validan en `src/lib/env.ts`.

## Supabase y R2 requieren credenciales

- **Supabase:** crear un proyecto dedicado de EFA y copiar la URL, la anon key y la service role key a `.env.local`.
- **Cloudflare R2:** crear el bucket, generar credenciales S3 y configurar CORS para permitir `PUT` desde el dominio del sitio.

## Migraciones

El esquema vive en `supabase/migrations/` como archivos `.sql` numerados (`0001_…` en adelante). **Nunca** se cambia la base a mano desde la app: todo cambio de esquema es una migración nueva.

- **Base nueva desde cero** (p. ej. el Supabase de desarrollo): pega `scripts/dev-schema.sql` en el SQL Editor — tiene todas las migraciones juntas, en orden e idempotentes.
- **Cambio puntual**: agrega `supabase/migrations/00XX_descripcion.sql` (siguiente número) y córrelo en el SQL Editor. Son idempotentes (`if not exists`, `drop policy if exists`).

El dueño es quien corre las migraciones en **producción**.

## Trabajo en equipo

Si vas a desarrollar con otra persona, lee **[`docs/colaboracion.md`](./docs/colaboracion.md)**: flujo de ramas + Pull Requests, qué accesos dar al colaborador, y cómo usar un Supabase de **desarrollo** aparte para no tocar los datos reales.
