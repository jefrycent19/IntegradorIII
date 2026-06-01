# syntax=docker/dockerfile:1
###############################################################################
# Backend Laravel — imagen de producción para Railway
#
# Base: serversideup/php (nginx + php-fpm + opcache, corre como www-data)
# Escucha en el puerto 8080.
###############################################################################
FROM serversideup/php:8.3-fpm-nginx

# --- Optimizaciones de producción ---
# Opcache encendido + autorun de tareas Laravel al arrancar el contenedor.
# (config/route/view cache aceleran cada request; migrate aplica el esquema)
ENV PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_STORAGE_LINK=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    AUTORUN_LARAVEL_CONFIG_CACHE=true \
    AUTORUN_LARAVEL_ROUTE_CACHE=true \
    AUTORUN_LARAVEL_VIEW_CACHE=true \
    AUTORUN_LARAVEL_EVENT_CACHE=true

WORKDIR /var/www/html

# serversideup corre como www-data; copiamos con esa propiedad
USER www-data

# Copiamos el código de la app
COPY --chown=www-data:www-data . .

# Instalamos dependencias PHP de producción con autoloader optimizado
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

EXPOSE 8080
