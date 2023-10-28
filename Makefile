init:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker.db.yml up -d
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build

upgrade:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build

nginx-reload:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker.nginx.yml up -d
	docker exec mhc_nginx nginx -t
	docker exec mhc_nginx nginx -s reload

backup-db: 
	docker compose -f docker.db.yml exec mariadb sh -c '\
		mkdir -p backup; \
		chmod -R 777 /backup; \
		mariadb-dump --user=medihome --password=Abc@12345 --lock-tables --all-databases > /backup/$$(date +%Y-%m-%d_%H-%M-%S).sql; \
		ls -la /backup; \
	'

restore-db:
	docker compose -f docker.db.yml exec mariadb sh -c '\
		ls -la /backup; \
		mariadb --user=medihome --password=Abc@12345 medihome_sql < /backup/2023-10-20_02-31-11.sql; \
	'
