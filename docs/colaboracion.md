# Trabajo en equipo — EFA Voley Club

Guía para desarrollar el código entre dos personas manteniendo **producción y la base de datos real bajo control del dueño** (Alex).

- **Dueño (admin):** administra Vercel y Supabase de producción. Revisa y aprueba todo lo que entra a producción.
- **Colaborador:** trabaja solo en el código, contra una base de datos de **desarrollo** (no la real). No tiene acceso a Vercel ni al Supabase de producción.

---

## 1. Flujo de trabajo (ramas + Pull Requests)

Nadie empuja directo a `main`. Todo entra por **Pull Request (PR)** que el dueño aprueba.

**El colaborador, por cada cambio:**
```bash
git checkout main
git pull                      # traer lo último
git checkout -b feat/mi-cambio
# ...trabajar, commitear...
git push -u origin feat/mi-cambio
```
Luego abre un **PR** en GitHub (`feat/mi-cambio` → `main`).

**El dueño:** revisa el PR, mira el **Preview** (URL automática de Vercel) y, si está bien, hace **merge**. Al mergear a `main`, Vercel despliega a producción.

> Regla de oro: a `main` solo se llega por PR aprobado. Las ramas de trabajo tienen prefijo `feat/`, `fix/`, etc.

---

## 2. Setup inicial del colaborador

1. Pedir al dueño acceso **Write** al repositorio de GitHub.
2. Clonar e instalar:
   ```bash
   git clone <url-del-repo>
   cd EFAVoleyClub
   npm install
   ```
3. Crear `.env.local` a partir de `.env.local.example`, con las **llaves del Supabase de DESARROLLO** que entrega el dueño (NO las de producción).
4. Correr en local:
   ```bash
   npm run dev          # http://localhost:3000
   npm run build        # verificar que compila antes de un PR
   npx vitest run       # correr los tests
   ```

**Qué NO hacer:**
- No empujar a `main` directamente.
- No usar ni pedir las llaves de producción.
- No subir `.env.local` ni secretos (ya está en `.gitignore`).

---

## 3. Base de datos: migraciones

El esquema vive en `supabase/migrations/` (archivos `.sql` numerados). **Nunca** se modifica la base a mano desde la app: todo cambio de esquema es un archivo de migración nuevo.

- Si tu cambio necesita tocar la base, **agrega un archivo** `supabase/migrations/00XX_descripcion.sql` (siguiente número) y descríbelo en el PR.
- El **colaborador** corre esa migración en el **Supabase de desarrollo** (SQL Editor) para probar.
- El **dueño** la corre en **producción** cuando aprueba el PR. Así el esquema real siempre lo controla el dueño.

Para montar una base de desarrollo desde cero, correr `scripts/dev-schema.sql` (tiene todas las migraciones juntas en orden).

---

## 4. Lo que configura el DUEÑO (una sola vez)

1. **Crear el Supabase de desarrollo:** nuevo proyecto en supabase.com (plan gratis), y correr `scripts/dev-schema.sql` en su SQL Editor. Entregar al colaborador: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` de **ese** proyecto.
2. **Proteger `main` en GitHub:** Settings → Branches → Add branch protection rule → `main`:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require review from Code Owners (usa el archivo `.github/CODEOWNERS`, que ya pide al dueño como revisor en cada PR)
   - (Opcional) ✅ Require status checks (el build de Vercel)

   > El repo ya trae una **plantilla de PR** (`.github/pull_request_template.md`) que recuerda declarar migraciones y probar en dev, y un **CODEOWNERS** que asigna al dueño como revisor automático.
3. **Agregar al colaborador:** Settings → Collaborators → Add people → rol **Write**.
4. **(Recomendado) Previews con la base de dev:** en Vercel, poner las variables de entorno con alcance **Preview** apuntando al Supabase de **desarrollo** (y dejar **Production** con las de producción). Así los PRs se previsualizan sin tocar datos reales.
5. **R2 (fotos):** opcional, crear un bucket de desarrollo aparte y dar esas llaves; o dejar R2 vacío en dev (las subidas de foto no funcionan en local pero el resto sí).

---

## 5. Resumen de accesos

| Servicio | Colaborador |
|---|---|
| GitHub | Colaborador del repo, rol **Write** |
| Vercel | **Ninguno** (ve sus cambios en los Previews automáticos) |
| Supabase producción | **Ninguno** |
| Supabase desarrollo | Llaves del proyecto de dev (en su `.env.local`) |

El dueño sigue siendo el único admin de Vercel y de la base de producción.
