FROM php:8.4-cli-alpine

# Instalar dependências de sistema e extensões PHP necessárias para Laravel 13
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apk add --no-cache bash netcat-openbsd curl dos2unix \
    && install-php-extensions pdo_mysql mbstring bcmath zip pcntl opcache

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar arquivos do projeto
COPY . .

# Converter quebras de linha para Unix caso tenha sido salvo no Windows
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Instalar dependências PHP
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]

