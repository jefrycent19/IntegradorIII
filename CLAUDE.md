# CLAUDE.md — Guía del proyecto para Claude Code

> Sistema de gestión para taller de motos. Proyecto Integrador, UTN Guanacaste 2026.
> Este archivo le da contexto a cualquier Claude Code que abra el repo. Léelo antes de trabajar.

## Qué es

Software para administrar un taller de motocicletas: clientes, motos, citas, **órdenes de
trabajo (OT)** con su flujo completo, inventario de repuestos, facturación, garantías y reportes.
Reemplaza el control manual en papel/Excel del taller.

**Dos apps, un solo backend y base de datos:**
- **Panel admin** — Ionic React (cross-platform, pensado para App Store / Play Store). Carpeta `admin/`.
- **Web cliente** — Laravel Blade (consulta de estado de OT y solicitud de citas sin login). Dentro de `backend/`.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend admin | Ionic React 8 + Capacitor + Vite + TypeScript |
| Estilos | Tailwind v4 + CSS custom properties (sistema "Garage Pro") |
| Backend / API | Laravel 13 + Sanctum (tokens, expiran a 7 días) |
| Base de datos | MySQL 8 (local vía Laragon; en prod MySQL de Railway) |
| Animación / iconos | framer-motion, lucide-react |
| Dev local | Laragon (MySQL), `php artisan serve`, `npm run dev` |

## Roles (5)

Administrador, Gerente, Jefe de Taller, Técnico, Recepcionista. Hay además un rol Cliente para
la web pública. Los permisos se aplican por rol en las rutas (`middleware('rol:Administrador,...')`).

**Usuario admin:** lo crea `UserSeeder` al correr `php artisan db:seed`. Pide las credenciales
al dueño del repo (no se versionan por seguridad).

## Arranque local

```bash
# Backend (desde backend/)
php artisan serve              # http://localhost:8000  (API en /api/v1 y web Blade)

# Admin Ionic (desde admin/)
npm run dev                    # http://localhost:5173
npm run dev -- --host          # además expone la LAN para probar en celular
```

El admin lee `VITE_API_URL` (en `admin/src/services/api.ts`), con fallback a
`http://localhost:8000/api/v1`. Hay `.env.production` (Railway) y `.env.local` (gitignored, para
apuntar el dev al backend de Railway).

## Producción

- **Backend EN VIVO en Railway:** https://integradoriii-production.up.railway.app
- Deploy por **Dockerfile** (serversideup/php:8.3-fpm-nginx, escucha en 8080). `railway.json` con
  healthcheck `/up` y autorun de migrate + caches al arrancar. Guía: `backend/DEPLOY_RAILWAY.md`.
- MySQL es un servicio de Railway en red privada → el `seed` solo se corre por `railway ssh`.
- Vars clave en Railway: `DB_URL=${{MySQL.MYSQL_URL}}`, `CACHE_STORE/SESSION_DRIVER/QUEUE_CONNECTION=database`,
  `LOG_CHANNEL=stderr`, `APP_DEBUG=false`. (Sin Redis en prod.)
- El **panel admin Ionic aún NO está desplegado** (pendiente).

## Estructura

```
admin/                Panel Ionic React
  src/
    pages/            Una carpeta por módulo (clientes, ordenes-trabajo, inventario, ...)
    components/       layout/Sidebar, ui/Button
    context/          AuthContext (login, token, tieneRol)
    services/         api.ts (axios + interceptor 401), auth.service.ts
    hooks/            useCanEdit, ...
    theme/variables.css   ← SISTEMA DE DISEÑO (ver abajo). Archivo crítico.
    App.tsx           Router (rutas privadas por token)
backend/              Laravel
  app/Http/Controllers/Api/   14 controllers (CRUD + lógica de negocio)
  routes/api.php      40+ rutas bajo /api/v1 con permisos por rol
  routes/web.php      Web cliente Blade
  database/           migraciones, seeders (RoleSeeder, UserSeeder, DemoSeeder)
docs/                 Documentación del proyecto
DESIGN.md, PRODUCT.md Scaffolding del sistema de diseño
```

## Lógica de negocio clave

- **Flujo de OT por etapas:** recepción → diagnóstico → reparación → lista → entregada.
  Cada cambio de etapa registra tiempos (`ot_tiempos_etapa`) y alimenta el **semáforo** de control de tiempos.
- **Inventario:** al vincular un repuesto a una OT se descuenta stock automáticamente y se registra el movimiento.
- **Facturación:** IVA 13% automático. Numeración automática: OT `OT-2026-00001`, facturas `F-2026-00001`.
- **Dashboard:** OT por estado, semáforo, facturación hoy/semana/mes, ticket promedio, stock bajo,
  citas de hoy, técnicos productivos, tiempo promedio de reparación. Cacheado 60s.
- **Web cliente:** consulta estado de OT por número o placa (sin login) y solicita citas
  (tabla `solicitudes_cita_web`).

## Sistema de diseño "Garage Pro" (panel admin)

Tema **oscuro + naranja mecánico**, bold. Todo en `admin/src/theme/variables.css` como CSS
custom properties; ese archivo también hace override global de los componentes Ionic a oscuro.

- Superficies: `--bg-base #070B18`, `--bg-surface`, `--bg-card #111827`, `--bg-hover`, `--border`
- Acento: `--accent #F97316` (naranja). Estados: success/warning/danger/info.
- Usa `var(--token)` en estilos inline; **no** hardcodees colores nuevos.
- Componente `ui/Button.tsx` (estilo Atlassian adaptado a naranja) — preferirlo para botones nuevos.
- Skills de diseño instalados en `.agents/skills/` (gitignored): emil-design-eng, impeccable, taste-skills.
- Fuente Inter por `<link>` en `index.html` (NO `@import` en CSS — rompe Vite).

## Convenciones y trampas conocidas (no repetir como bugs)

- **Rutas con id numérico:** en `App.tsx` se usa `:id(\d+)` para que `/nuevo` y `/nueva` no caigan
  por error en la vista de Detalle.
- **Colecciones Laravel vacías** serializan como `{}` y rompen `.map()` en el front. El backend usa
  `->all()` / `->values()->all()`; el front normaliza con `Array.isArray()`.
- **Foco accesible:** `:focus-visible` usa **box-shadow** (respeta `border-radius`), no `outline`,
  para que las pastillas redondas no se vean cuadradas.
- **Móvil:** `-webkit-tap-highlight-color: transparent` global para que no salga un recuadro gris al tocar.
- **Railway + `config:cache`:** nunca uses `env()` fuera de archivos `config/`. Valores van en `config/app.php`.
- Git: la rama por defecto es **`main`** (no master). Repo: https://github.com/jefrycent19/IntegradorIII

## Idioma

El proyecto y el usuario trabajan en **español**. Código en español (variables, comentarios, mensajes
de commit). Responde en español.
