#!/bin/bash
set -e

echo "=== Iniciando Sistema Escriba - Backend ==="

# Aguardar MySQL estar pronto
echo "Aguardando banco de dados MySQL em ${DB_HOST}:${DB_PORT}..."
while ! nc -z ${DB_HOST} ${DB_PORT}; do
  sleep 1
done
echo "✓ Banco MySQL conectado com sucesso!"

# Gerar APP_KEY se ausente
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi

# Ajustar permissões das pastas de storage e cache
chmod -R 777 storage bootstrap/cache || true

# Executar migrations e seeders
echo "Executando migrations do banco..."
php artisan migrate --force

echo "Executando seeders de usuários e unidades..."
php artisan db:seed --force || true

echo "=== Servidor Laravel 13 pronto! Iniciando escuta na porta 8000 ==="
exec php artisan serve --host=0.0.0.0 --port=8000

