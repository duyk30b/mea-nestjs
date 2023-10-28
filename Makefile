init-db:
	docker compose -f docker.db.yml up -d

upgrade:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
	docker compose logs -f api_public

hotfix:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/hotfix
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
	docker compose logs -f api_public

up:
	docker compose up -d
	docker compose logs -f api_public

down:
	docker compose down
	
logs:
	docker compose logs -f api_public

nginx-reload:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker.nginx.yml up -d
	docker exec mc_nginx nginx -t
	docker exec mc_nginx nginx -s reload

backup-db: 
	docker compose -f docker.db.yml exec postgres sh -c '\
		mkdir -p backup; \
		chmod -R 777 /backup; \
		pg_dump "dbname=mea_sql user=mea password=Abc12345" > /backup/$$(date +%Y-%m-%d_%H-%M-%S).sql; \
		ls -la /backup; \
	'

restore-db:
	docker compose -f docker.db.yml exec postgres sh -c '\
		ls -la /restore; \
		psql "dbname=mea_sql user=mea password=Abc12345" < /restore/$$(ls -1 /restore); \
	'

backup-mariadb: 
	docker compose -f docker.db.yml exec mariadb sh -c '\
		mkdir -p backup; \
		chmod -R 777 /backup; \
		mariadb-dump --user=mea --password=Abc12345 --lock-tables --all-databases > /backup/$$(date +%Y-%m-%d_%H-%M-%S).sql; \
		ls -la /backup; \
	'

restore-mariadb:
	docker compose -f docker.db.yml exec mariadb sh -c '\
		ls -la /restore; \
		mariadb --user=mea --password=Abc12345 mea_sql < /restore/$$(ls -1 /restore); \
	'
		