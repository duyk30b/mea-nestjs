init:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker.db.yml up -d
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
	# docker compose exec api-public sh -c 'npm run migration:run && npm run fake:data'

upgrade:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
	# docker compose exec api-public sh -c 'npm run migration:run'

nginx-reload:
	git fetch --all
	git log --all --oneline --graph -10
	git reset --hard origin/master
	docker compose -f docker.nginx.yml up -d
	docker exec mhc_nginx nginx -t
	docker exec mhc_nginx nginx -s reload
