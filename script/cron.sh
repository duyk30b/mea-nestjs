#!/bin/bash

# Run: sh ./script/cron.sh
# Cấp quyền chạy file: chmod +x ./script/cron.sh

WORKING_DIR="$(dirname "$(realpath "$0")")"

# File script và stdout, stderr
SCRIPT_FILE="./backup-postgres.sh"
STDOUT_LOG="../data/logs/backup-postgres-stdout.log"
STDERR_LOG="../data/logs/backup-postgres-stderr.log"

# JOB_ID là tên job để phân biệt với các job khác
JOB_ID="backup_postgres"

# Chạy lúc 19h hàng ngày (2h sáng giờ Việt Nam)
CRON_EXPRESSION="0 19 * * * cd $WORKING_DIR && $SCRIPT_FILE >> $STDOUT_LOG 2>> $STDERR_LOG #JOB_ID=$JOB_ID"

# Xóa cronjob cũ theo JOB_ID
crontab -l 2>/dev/null | grep -v "#JOB_ID=$JOB_ID" | crontab -

# Thêm cronjob mới
(crontab -l 2>/dev/null; echo "$CRON_EXPRESSION") | crontab -;
echo "List cronjob:";
crontab -l;

# Grep log cronjob
# grep CRON /var/log/syslog