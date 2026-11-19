# Portal del Jugador — Diseño

**Fecha:** 2026-11-18
**Estado:** Diseño aprobado en conversación. Pendiente revisión escrita del usuario.

## Visión general

Hoy los jugadores son filas sueltas en `players` (sin cuenta). Queremos un **portal del jugador**: tras ser aprobado, la persona entra a la plataforma (sin contraseña, con enlace mágico), completa un perfil rico, ve su progreso de forma bonita, y recibe la invitación al próximo juego. El club gana datos accionables (números por equipo, pedido de camisetas, EPS, etc.) y una comunidad.

Es grande, así que se construye por **sub-fases "Portal"**, cada una funcionando y probada:

| Fase | Incluye |
|---|---|
| **Portal 1 — Base** (esta spec) | Acceso por enlace mágico · Equipos (con tipo) · aprobar = asignar equipo · perfil completo (número, posición en cancha visual, camiseta, foto, edad, EPS, contacto emergencia, experiencia, disponibilidad, mano dominante) · anillo de % · link de invitación por WhatsApp |
| **Portal 2 — Juego** | Próximo juego · Agregar a Google Calendar · "Voy / No voy" · reportar lesión/molestia (con tipo) |
| **Portal 3 — Comunidad** | Gamificación (motor + primeros logros) · carné digital · ver compañeros · cumpleaños del mes |
| **Portal 4 — Admin+** | Pedido de camisetas consolidado · roster por equipo · vista de EPS/emergencia |
| **Portal 5 — App** | PWA instalable + notificaciones web push + recordatorios automáticos |

Esta especificación cubre **Portal 1**. El resto se especifica al llegar a cada fase.

---

## ⚠️ Prerrequisito (acción del usuario): verificar dominio en Resend

Hoy Resend envía desde `onboarding@resend.dev` y **solo puede entregar a `efavoleyclub@gmail.com`** (el correo dueño de la cuenta). Para enviarle el enlace mágico a **cualquier jugador**, hay que **verificar el dominio `efavoleyclub.com` en Resend** (agregar unos registros DNS: SPF/DKIM). Es gratis y se hace una vez. Guía paso a paso se entrega al construir; sin esto, los correos a jugadores no salen.

Mientras no esté verificado: el magic link igual se puede **copiar/compartir manualmente** desde el panel para pruebas, pero el envío automático al jugador requiere el dominio verificado.

---

## Portal 1 — Alcance

### Acceso del jugador (enlace mágico)
- **Supabase Auth** con OTP/magic link. Rol por defecto `jugador` (ya garantizado por migración 0007).
- Páginas:
  - `/acceso` — el jugador escribe su correo y recibe un enlace mágico para entrar (auto-servicio para volver). Comparte diseño con el futuro botón de Google (Parte 2).
  - `/auth/callback` — ruta que intercambia el código por sesión (compartida con Google después).
  - `/jugador` — portal del jugador (requiere sesión `jugador`): saludo, **anillo de % del perfil**, acceso a editar perfil, botón "invitar por WhatsApp". (El próximo juego llega en Portal 2.)
  - `/jugador/perfil` — formulario de perfil completo.
- **Al aprobar** a un jugador, el admin dispara el correo "Completa tu perfil" con el enlace mágico (generado server-side y enviado vía Resend). El enlace lleva a `/jugador/perfil`.
- **Enlace jugador ↔ cuenta:** se agrega `players.user_id`. En el primer ingreso, se enlaza la fila `players` con el usuario de auth **por correo** (comparación en minúsculas).

### Equipos y números
- `teams`: `id`, `nombre`, `tipo` ∈ (`entrenamiento`, `oficial`), `created_at`.
- `team_members`: `id`, `team_id`, `player_id`, `numero int null`, `created_at`.
  - `unique(team_id, player_id)` y `unique(team_id, numero)` (número único **por equipo**).
- Un jugador puede estar en **hasta 2 equipos** (idealmente uno de cada tipo).
- **Número:** lo elige el jugador en su perfil. El sistema valida que esté libre **en ese equipo** y, si el jugador está en dos equipos, **sugiere/reserva el mismo número** en ambos cuando está disponible. Si está tomado, le muestra los números libres.
- **Admin:**
  - `/admin/equipos` — crear/listar/editar equipos (nombre + tipo). Nueva entrada en el menú (permiso de sección `equipos`, delegable).
  - **Aprobación** (`/admin/jugadores`): aprobar ahora **exige elegir un equipo** (desplegable). Se puede añadir un segundo equipo después desde el detalle del jugador. (Membresías adicionales: gestión simple en admin.)

### Campos del perfil (nuevas columnas en `players`)
Todos **obligatorios** (con opción "No sé/No aplica" donde corresponde):
- `foto_url text` — foto (sube a R2, con la compresión cliente ya existente). Avatar redondo.
- `posiciones text[]` — **máx. 2** de: `armador`, `opuesto`, `central`, `punta`, `libero`, o `no_se`. Selección sobre **cancha visual** (componente que dibuja la cancha; el jugador toca zonas y se resaltan).
- `experiencia int` — escala **1–10** con barra; muestra en texto qué significa el valor elegido. Anclas:
  - 1–2: Nunca o casi nunca he jugado; aprendiendo las reglas.
  - 3–4: He jugado informal (recreo/playa); conozco lo básico.
  - 5–6: Juego con regularidad; entiendo rotación y posiciones.
  - 7–8: Experiencia sólida; he jugado en equipos/ligas locales.
  - 9–10: Competitivo; torneos, domino reglas y técnica.
  (Texto fino por número se ajusta al construir.)
- `mano_dominante text` — `diestro` | `zurdo` | `no_se`.
- `disponibilidad text[]` — días que puede (p. ej. `martes`, `viernes`; sale de los horarios del club).
- `eps text` — EPS/seguro (visible solo para admins en Portal 4).
- `contacto_emergencia` (ya existe) — nombre y teléfono.
- `fecha_nacimiento` (ya existe) — se pide; se calcula la **edad** y sirve para cumpleaños (Portal 3).
- Camiseta: `quiere_camiseta bool`, `camiseta_color text` (`roja`|`negra`|`ambas`), `camiseta_talla text` (`XS`..`XXL`), `apodo text` (nombre para la espalda).
- `perfil_completo_at timestamptz` — se marca al llegar al 100% (para logro en Portal 3).

### Anillo de "% de perfil completo"
- Un **anillo de progreso** + lista de verificación al lado: cada dato llena el anillo y palomea su ítem.
- Mensajes que animan ("¡Casi listo! Te falta la foto 📸") y estado celebratorio al 100% ("¡Perfil completo! 🎉").
- Cuentan para el %: foto, posiciones, experiencia, fecha de nacimiento, EPS, contacto de emergencia, mano dominante, disponibilidad, decisión de camiseta y **número en su(s) equipo(s)**.
- El **admin** ve el mismo % por jugador en `/admin/jugadores`.

### Invitar por WhatsApp
- Botón que abre WhatsApp con un mensaje prellenado + el enlace de registro del club (`https://wa.me/?text=...`). Sin número destino (lo elige quien comparte).

---

## Seguridad / RLS
- `jugador` NO entra a `/admin` (ya cubierto por roles 0007).
- Un jugador solo puede leer/editar **su propia** fila `players` y sus `team_members` (policies por `user_id`/email). Lectura pública sigue sin exponer datos sensibles (EPS/emergencia solo admin).
- Escrituras del admin sobre equipos/membresías: policies admin; mutaciones sin política se hacen con `createAdminClient()` tras `requireAdmin()/requirePerm()` (patrón ya establecido).
- Migración nueva (`0008_portal_jugador.sql`) se corre a mano en Supabase (DDL).

## Fuera de alcance de Portal 1 (va en fases siguientes)
- Próximo juego, Google Calendar, "Voy/No voy", lesión/molestia → Portal 2.
- Gamificación, carné digital, ver compañeros, cumpleaños → Portal 3.
- Pedido de camisetas, roster/EPS admin → Portal 4.
- PWA + push + recordatorios → Portal 5.
- Login con Google (admins y jugadores) → "Parte 2" de la Fase B, después del Portal.

## Pruebas
- Helpers puros con tests (Vitest): validación de número por equipo, cálculo de %, validación de posiciones (máx 2), rango de experiencia.
- Verificación e2e con Playwright: aprobar→asignar equipo, abrir perfil vía magic link (en local), completar campos, ver anillo subir, número duplicado rechazado.
- Build + 43 tests actuales siguen verdes.
