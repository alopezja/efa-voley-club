# EFA Voley Club

Sitio web del club de voleibol **Eso Fue Adentro (EFA)**: noticias, convocatorias, galería e inscripciones.

## Stack

- Next.js 15 (App Router, `src/`) + React 19 + TypeScript
- Tailwind CSS v4 (tokens del club en `src/app/globals.css`)
- Supabase (Postgres + Auth) para datos
- Cloudflare R2 (compatible con S3) para imágenes, con presigned uploads
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

Las migraciones están en `supabase/migrations/`:

1. `0001_init.sql` (esquema)
2. `0002_rls.sql` (políticas RLS)

Ejecutarlas en orden, ya sea pegándolas en el SQL Editor del proyecto de Supabase, o con la CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```
