# Desplegar el backend en Railway

Guía paso a paso para subir el backend Laravel a [Railway](https://railway.app).

El backend ya incluye:
- `Dockerfile` — imagen de producción (nginx + php-fpm + opcache), escucha en el puerto **8080**
- `railway.json` — build por Dockerfile + healthcheck en `/up`
- `.dockerignore` — excluye `vendor/`, `.env`, `node_modules/`, etc.

---

## 1. Crear el proyecto en Railway

1. Entra a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Selecciona el repo `jefrycent19/IntegradorIII`.
3. En **Settings → Source** del servicio, pon **Root Directory** = `backend`
   (el código de Laravel vive en la subcarpeta `backend/`).
4. Railway detectará el `Dockerfile` automáticamente.

## 2. Agregar la base de datos MySQL

1. En el proyecto → **New** → **Database** → **Add MySQL**.
2. Railway crea el servicio MySQL y expone variables como `MYSQL_URL`, `MYSQLHOST`, etc.

## 3. Configurar las variables de entorno

En el servicio del backend → pestaña **Variables**, agrega:

| Variable | Valor |
|---|---|
| `APP_NAME` | `Taller Motos` |
| `APP_ENV` | `production` |
| `APP_KEY` | *(ver paso 3.1)* |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://TU-SERVICIO.up.railway.app` |
| `APP_FRONTEND_URL` | URL del panel admin (ej. el dominio donde despliegues Ionic) |
| `DB_CONNECTION` | `mysql` |
| `DB_URL` | `${{MySQL.MYSQL_URL}}` *(referencia al servicio MySQL)* |
| `CACHE_STORE` | `database` |
| `SESSION_DRIVER` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `error` |
| `MAIL_MAILER` | `log` *(o configura un SMTP real)* |

> **`DB_URL` con `${{MySQL.MYSQL_URL}}`**: Railway sustituye la referencia por la
> cadena de conexión completa del MySQL. Laravel la parsea sola (config `mysql.url`).

### 3.1 Generar el APP_KEY

En tu máquina, dentro de `backend/`:

```bash
php artisan key:generate --show
```

Copia el resultado (`base64:....`) y pégalo en la variable `APP_KEY` de Railway.

## 4. Configurar el puerto

En **Settings → Networking** del servicio backend:
1. **Generate Domain** (te da la URL pública).
2. Si pide **Target Port**, pon **`8080`** (es el puerto donde escucha la imagen).

## 5. Primer deploy

Railway construye y despliega automáticamente. En el arranque, el contenedor:
- aplica las migraciones (`migrate --force`)
- cachea config / rutas / vistas / eventos
- crea el symlink de storage

Cuando el healthcheck `/up` pase, el servicio queda **Active**.

## 6. Sembrar datos iniciales (una sola vez)

Las migraciones crean las tablas, pero faltan los **roles** y el **usuario admin**.
Desde la terminal del servicio en Railway (**⋯ → Shell** o `railway run`):

```bash
php artisan db:seed --force
```

Esto ejecuta `RoleSeeder` + `UserSeeder`. (Para datos de demo: `php artisan db:seed --class=DemoSeeder --force`.)

## 7. Apuntar el panel Ionic al backend

En `admin/src/services/api.ts`, cambia el `baseURL` de
`http://localhost:8000/api/v1` por `https://TU-SERVICIO.up.railway.app/api/v1`
(idealmente vía variable de entorno de Vite).

---

## Notas

- **Sin Redis**: la app usa el driver `database` para caché/sesión/cola, así que
  **no necesitas** un servicio Redis. Si en el futuro agregas uno, cambia
  `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis` y las vars `REDIS_*`.
- **Healthcheck**: Laravel expone `/up` (configurado en `bootstrap/app.php`).
- **HTTPS**: Railway termina TLS en el borde; el backend ya confía en el proxy
  (`trustProxies` en `bootstrap/app.php`), así que las URLs https se generan bien.
- **Logs**: con `LOG_CHANNEL=stderr` los ves directo en la pestaña *Deployments → Logs*.
