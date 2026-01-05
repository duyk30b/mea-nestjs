#!/bin/bash

# Cấp quyền chạy file: chmod +x ./script/backup-postgres.sh 

USER=$(whoami)
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
POSTGRES_PASSWORD="Abc12345"
POSTGRES_USER="mea"
POSTGRES_DB="mea_sql"

echo "---------------------------------------------------------------------------------------"
NOW_UTC=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
NOW_VN=$(TZ=Asia/Ho_Chi_Minh date '+%Y-%m-%d %H:%M:%S ICT')
echo "$NOW_UTC - [BACKUP_POSTGRES][$USER] Starting backup process..."
echo "Working directory: $SCRIPT_DIR"

git log master -2 --oneline

# Chỉ giữ lại 3 bản sao lưu gần nhất
# Lưu ý: Đường dẫn /backup/ là đường dẫn trong container, không phải trên host
# Sử dụng ls -tp để liệt kê các file trong thư mục /backup/ và sắp xếp theo thời gian tạo
# Sử dụng grep -v "/$" để loại bỏ các thư mục
# Sử dụng tail -n +2 để lấy tất cả các file từ file thứ 2 trở đi
# Sử dụng xargs để xóa các file đó
# Sử dụng -I {} để thay thế {} bằng tên file
# Sử dụng rm -- {} để xóa file đó
cd $PROJECT_DIR && docker compose -f docker-compose.production.yml exec postgres sh -c '\
  PGPASSWORD=$POSTGRES_PASSWORD pg_dump -U $POSTGRES_USER $POSTGRES_DB > /backup/$(date +%Y-%m-%d_%H-%M-%S).sql && \
  ls -tp /backup/*.sql | grep -v "/$" | tail -n +2 | xargs -I {} rm -- {} && \
  ls -la /backup \
'

NOW_UTC=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
echo "$NOW_UTC - [BACKUP_POSTGRES][$USER] Finished backup process !!!"
echo "---------------------------------------------------------------------------------------"