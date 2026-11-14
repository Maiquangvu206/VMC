# syntax=docker/dockerfile:1

# ---------- Frontend build ----------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY vite.config.js tailwind.config.js postcss.config.js* index.html ./
COPY resources ./resources
COPY public ./public
COPY src ./src
RUN npm run build

# ---------- PHP dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# ---------- Runtime ----------
FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath zip gd \
    && rm -rf /var/lib/apt/lists/*

# OPcache cho CLI SAPI (artisan serve dùng PHP CLI, mặc định opcache bị tắt).
COPY docker/php-production.ini /usr/local/etc/php/conf.d/zz-vmc-production.ini

WORKDIR /var/www/html

# App source
COPY . .
# Vendor deps
COPY --from=vendor /app/vendor ./vendor
# Built frontend assets (Vite outputs to dist; custom plugin copies to public/assets + public/index.html)
COPY --from=frontend /app/dist ./dist
COPY --from=frontend /app/public/assets ./public/assets
COPY --from=frontend /app/public/index.html ./public/index.html

# Storage & cache permissions
RUN mkdir -p storage/framework/{sessions,views,cache/data} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
# php artisan serve (PHP built-in server) mặc định chỉ có 1 worker => 15 request API
# song song của SPA bị xếp hàng, mỗi request chờ hàng chục giây. 8 worker chạy song song.
ENV PHP_CLI_SERVER_WORKERS=4

# Render provides PORT
EXPOSE 8000

CMD php artisan config:cache || true; \
    php artisan route:cache || true; \
    php artisan view:cache || true; \
    if [ "$RUN_MIGRATIONS" = "true" ]; then php artisan migrate --force || true; fi; \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
