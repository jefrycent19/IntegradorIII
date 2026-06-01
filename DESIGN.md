# Design

Sistema visual **Garage Pro** del panel admin (Ionic React + Tailwind v4). Tokens en `admin/src/theme/variables.css`.

## Theme

Oscuro, mecánico, bold. La superficie es casi-negra azulada (no gris neutro), el acento es un naranja de señalización de taller. Dark no es default estético: el personal trabaja bajo luz de taller variable y necesita contraste alto y estado legible de lejos.

## Color

OKLCH/hex actuales (hex por compatibilidad con el código existente):

| Rol | Token | Valor |
|---|---|---|
| Fondo base | `--bg-base` | `#070B18` |
| Superficie | `--bg-surface` | `#0D1425` |
| Card | `--bg-card` | `#111827` |
| Hover | `--bg-hover` | `#1A2340` |
| Borde | `--border` | `#1E2D45` |
| Borde claro | `--border-light` | `#243352` |
| Texto primario | `--text-primary` | `#F8FAFC` |
| Texto secundario | `--text-secondary` | `#94A3B8` |
| Texto muted | `--text-muted` | `#475569` |
| **Acento** | `--accent` | `#F97316` (naranja) |
| Acento claro | `--accent-light` | `#FB923C` |
| Éxito / Advertencia / Peligro / Info | `--success` `--warning` `--danger` `--info` | `#22C55E` `#EAB308` `#EF4444` `#3B82F6` |

**Estrategia de color:** Restrained — neutrales tintados (azulados, no grises) + un acento naranja ≤10% de la superficie, reservado para acción primaria y estado activo. El estado de OT tiene su propia escala (recepción gris, diagnóstico amarillo, reparación azul, lista verde, entregada muted).

## Typography

- Familia única: **Inter** (300–900) vía `<link>` en `index.html`. Una sola familia con contraste de peso, no 3 tipografías.
- Jerarquía por escala + peso: títulos `font-black` con `letter-spacing` apretado (mínimo −0.04em, sin pasarse), cuerpo en peso medio.
- Labels/eyebrows en mayúsculas solo para etiquetas cortas (≤4 palabras), nunca en cuerpo.

## Motion

Tokens de easing fuertes (curvas exponenciales, sin bounce) definidos en `variables.css`:

- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — entradas/salidas, feedback (lo más usado).
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` — movimiento en pantalla.
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` — drawers estilo iOS.

Reglas: UI bajo 300ms; nunca `ease-in`; nunca `transition: all`; solo animar `transform`/`opacity`. Feedback al presionar (`scale(0.97)`) en elementos presionables. Pantallas de alta frecuencia (listas, navegación) casi sin animación. `prefers-reduced-motion` reduce a crossfade/instantáneo.

## Components

- **Sidebar** (`components/layout/Sidebar.tsx`): nav con estado activo en gradiente naranja, badge de rol por color, avatar con anillo.
- **Cards**: `--bg-card` + borde 1px, radio 12–16px (nunca 24px+). Sin border-left de acento (anti-patrón).
- **Botón primario**: pill naranja con gradiente + sombra naranja sutil; feedback al presionar.
- **Inputs**: fondo card, borde que pasa a naranja en focus.
- **Toasts**: Ionic `useIonToast`, 3s.

## Layout

App-shell: sidebar fijo (lg) / drawer (móvil) + contenido. Flex para 1D, grid para tarjetas (`auto-fit minmax`). Ritmo por espaciado variable, no uniforme.
