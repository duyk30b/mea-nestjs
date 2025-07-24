#!/bin/bash

docker ps -a
echo ">>> Dừng container nginx"
docker stop mc_nginx

echo ">>> Xóa chứng chỉ cũ trong thư mục project"
ls -la ./nginx/ssl/letsencrypt/
rm -rf ~/mea-nestjs/nginx/ssl/letsencrypt/api.medihome.vn
ls -la ./nginx/ssl/letsencrypt/

echo ">>> Xóa dữ liệu chứng chỉ hệ thống"
ls -la /etc/letsencrypt
rm -rf /etc/letsencrypt/*
ls -la /etc/letsencrypt

echo ">>> Cấp mới chứng chỉ với certbot"
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  -d api.medihome.vn \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  --non-interactive

echo ">>> Copy chứng chỉ vào thư mục nginx"
cp -R /etc/letsencrypt/archive/* ~/mea-nestjs/nginx/ssl/letsencrypt/
ls -la ./nginx/ssl/letsencrypt/

echo ">>> Khởi động lại nginx"
docker compose -f docker-compose.production.yml up -d nginx

echo ">>> Kiểm tra cấu hình nginx"
docker exec mc_nginx nginx -t
