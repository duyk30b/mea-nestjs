#!/bin/sh

# Run: sh ./script/cron.sh
# Cấp quyền chạy file: chmod +x ./script/cron.sh
WORKING_DIR="$(cd "$(dirname "$0")" && pwd)"

# File script và stdout, stderr
SCRIPT_FILE="./backup-postgres.sh"
STDOUT_LOG="../data/logs/backup-postgres-stdout.log"
STDERR_LOG="../data/logs/backup-postgres-stderr.log"

# JOB_ID là tên job để phân biệt với các job khác
JOB_ID="backup_postgres"

# Chạy lúc 19h hàng ngày (2h sáng giờ Việt Nam)
UTC_HOUR=19
UTC_MINUTE=00

# Ghép thành giờ UTC hợp lệ
UTC_TIME=$(printf "%02d:%02d UTC" "$UTC_HOUR" "$UTC_MINUTE")
# Chuyển sang local timezone của máy
LOCAL_HOUR=$(date -d "$UTC_TIME" +"%H")
LOCAL_MINUTE=$(date -d "$UTC_TIME" +"%M")

echo "NOW: $(date)"
echo "Crontab at: ${UTC_HOUR}:${UTC_MINUTE} UTC0 == ${LOCAL_HOUR}:${LOCAL_MINUTE} UTC$(date +"%Z")"

# Chạy theo giờ local đã tính toán
CRON_EXPRESSION="${LOCAL_MINUTE} ${LOCAL_HOUR} * * * cd $WORKING_DIR && bash $SCRIPT_FILE >> $STDOUT_LOG 2>> $STDERR_LOG #JOB_ID=$JOB_ID"

# Xóa job cũ và thêm job mới
(crontab -l 2>/dev/null | grep -v "#JOB_ID=$JOB_ID"; echo "$CRON_EXPRESSION") | crontab -
echo "List cronjob: crontab -l"
crontab -l

# Command for remove all crontab
# crontab -r
# Command for show log crontab
# grep CRON /var/log/syslog | tail -10
# Hoặc xem realtime
# sudo tail -f /var/log/syslog | grep CRON