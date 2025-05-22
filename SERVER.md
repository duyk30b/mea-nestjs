1. Ubuntu 22.04
- Check OS: `lsb_release -a`
- Check user: `whoami`
- Đổi mật khẩu: `passwd`
- Check IP: `hostname -I`
- Kiểm tra CPU: `lscpu`
- Kiểm tra RAM: `free -h`
- Kiểm tra dung lượng ổ đĩa: `df -h`
- Lấy đường dẫn tuyệt đối: `readlink -f ./`

2. Check App: `htop`, `git --version`

3. Prepare Project
- Cài đặt SSH để clone project từ github

4. Run Project
- Init: `docker compose -f docker-compose.production.yml up -d`
- Logs: `docker logs -f mc_api_public`
- Check Postgres: [http](http://ip.ip.ip.ip:23080)
- Check Redis: [http](http://ip.ip.ip.ip:25540)

5. Data
- Reset permission
- Login Google Driver

6. Cron Job
- Lấy list crontab: `crontab -l`
- Thêm sửa crontab (dùng nano hoặc vim): `crontab -e`
- Thêm cuối file crontab (chạy vào 20h hàng ngày): `* 20 * * * cd /home/duy/MEA/mea-nestjs && ./script/backup-postgres.sh`
7. Other
- CMD history: `sudo cat /root/.bash_history`