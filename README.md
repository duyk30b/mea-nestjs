## I. Setup
1. Init Mariadb and Redis: `docker compose -f docker.db.yml up -d`
2. Start Nginx for run SSL: `docker compose -f docker.nginx.yml up -d`
3. Init Kafka Server: `docker compose -f docker.kafka.yml up -d`
4. Install NodeJS in local:
- Install nvm on Windows: https://github.com/coreybutler/nvm-windows/releases

- Install nvm on Ubuntu: 
`sudo apt install curl `
`curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`
`source ~/.bashrc`

- Install NodeJs 16 and dependencies 
`nvm install 16.18.1`
`nvm use 16.18.1` OR `nvm use $(Get-Content .nvmrc)` (Windows)
`npm install`

## II. Run project
1. Initialize database
- Run Migration: `npm run migration:run`
- Fake database: `npm run seed:data`
- When change entity, create migration: `npm run migration:generate --name=change-db` (recommend) or `npm run migration:create --name=change-db`
- When revert migration: `npm run migration:revert`

2. When build project: `npm run build`

3. Run project in local: `npm run dev api-public` 
==> Now, access: http://localhost:20000/document

4. Run project with Docker in production: `docker compose -f docker-compose.production.yml --env-file .env.production up -d --build`
==> Now, access: http://localhost:7300/document

## III. Nginx
1. openSSL
```
openssl req -days 3650 -x509 -newkey rsa:2048 -sha256 -nodes -keyout %UserProfile%\Desktop\key.pem -out %UserProfile%\Desktop\cert.pem -subj "/C=/ST=/L=/O=/OU=web/CN=medihome.vn"
```
2. Certbot
```
rm -rf /etc/letsencrypt/archive/*
rm -rf ~/mh-nestjs/nginx/ssl/letsencrypt/*
sudo docker run -it --rm --name certbot -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -p 80:80 certbot/certbot certonly
ls -la /etc/letsencrypt/archive/*
cp -R /etc/letsencrypt/archive/* ~/mh-nestjs/nginx/ssl/letsencrypt/
cd ~/mh-nestjs/nginx/ssl/letsencrypt/
ls -la
mv medihome.ga-0003 medihome.ga
cd ~/mh-nestjs/
docker compose -f docker.nginx.yml up -d
```

2. Nginx
- Check syntax: `docker exec mhc_nginx nginx -t`
- Reload: `docker exec mhc_nginx nginx -s reload`

## IV. Kafka
- Enter Kafka by docker: `docker exec -it mhc_kafka /bin/sh`
- Cd bash: `$ cd /opt/bitnami/kafka/bin`
- Get list topic: `$ kafka-topics.sh --list --bootstrap-server localhost:9092`

## V. Rule "api-public"
1. DTO 
- All field must be validate (because use whiteListValidation)
- If field must be exist => validate: IsDefined()

## Other
1. Linux: 
- Show all port: `netstat -tulpn`
- List env: `printenv`

2. NestJS
- Create new app: `nest generate app my-app`
- Create new library: `nest g library my-library`
- Create new module: `nest g resource modules/my-module`
