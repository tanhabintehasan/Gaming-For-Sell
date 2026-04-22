# 速凌电竞 - CentOS 7 ECS 部署指南

> ⚠️ 注意：您的服务器运行 CentOS 7。CentOS 7 已于 2024年6月停止维护，部分新软件可能不兼容。建议后续升级到 Rocky Linux 8/9 或 AlmaLinux 8/9。
>
> 本项目使用 Next.js 16，需要 Node.js 18.x（CentOS 7 能支持的最高版本）。

---

## 1. 服务器环境准备

在阿里云 ECS (CentOS 7) 的 Workbench 终端中逐行执行：

```bash
# 1.1 更新系统
sudo yum update -y

# 1.2 安装基础工具
sudo yum install -y git wget curl vim

# 1.3 安装 Node.js 18.x（CentOS 7 支持的最高版本）
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证版本
node -v   # 应显示 v18.x.x
npm -v    # 应显示 9.x.x 或 10.x.x

# 1.4 安装 PM2（进程管理器）
sudo npm install -g pm2

# 1.5 安装 Nginx（通过 EPEL）
sudo yum install -y epel-release
sudo yum install -y nginx

# 1.6 设置开机自启
sudo systemctl enable nginx
```

---

## 2. 配置环境变量

```bash
# 创建应用目录
sudo mkdir -p /var/www/su-ling-esports
sudo chown $(whoami):$(whoami) /var/www/su-ling-esports
cd /var/www/su-ling-esports

# 创建生产环境变量文件
nano .env.production
```

填入以下内容（**请替换为您的真实配置**）：

```env
# =========================
# DATABASE (Supabase PostgreSQL)
# =========================
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"

# =========================
# AUTH / SECURITY
# =========================
JWT_SECRET="your-strong-jwt-secret-min-32-characters-long"

# =========================
# APP URL (改为您的 ECS IP 或域名)
# =========================
NEXTAUTH_URL="http://47.109.178.81"
NEXT_PUBLIC_APP_URL="http://47.109.178.81"

# =========================
# OPTIONAL
# =========================
# SOCKET_URL=""
# API_BASE_URL=""
```

保存：`Ctrl+O` → `Enter` → `Ctrl+X`

---

## 3. 拉取代码 & 构建

```bash
cd /var/www/su-ling-esports

# 克隆代码
git clone https://github.com/tanhabintehasan/Gaming-For-Sell.git .

# 如果已存在代码，更新即可：
# git pull origin main

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移（首次部署需要）
npx prisma migrate deploy

# 构建生产版本
npm run build
```

> 如果构建时报内存不足错误，可以添加 swap：
> ```bash
> sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> ```

---

## 4. 启动应用 (PM2)

```bash
cd /var/www/su-ling-esports

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'su-ling-esports',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
    },
    autorestart: true,
    max_memory_restart: '1G',
  }],
}
EOF

# 启动
pm2 start ecosystem.config.js

# 保存配置并设置开机自启
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $HOME

# 查看状态
pm2 status
pm2 logs su-ling-esports
```

---

## 5. 配置 Nginx（CentOS 7 路径）

CentOS 7 的 Nginx 配置文件路径与 Ubuntu 不同，使用 `/etc/nginx/conf.d/`：

```bash
# 创建 Nginx 配置
sudo tee /etc/nginx/conf.d/su-ling-esports.conf << 'EOF'
server {
    listen 80;
    server_name _;  # 有域名后改为：server_name yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 支持（聊天/通知）
    location /api/socket {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 6. 配置阿里云安全组

在阿里云控制台 → ECS → 安全组，添加以下**入方向**规则：

| 端口 | 协议 | 授权对象 | 说明 |
|------|------|----------|------|
| 80 | TCP | 0.0.0.0/0 | HTTP 访问 |
| 443 | TCP | 0.0.0.0/0 | HTTPS（后续配 SSL） |
| 3000 | TCP | 0.0.0.0/0 | 可选，调试用 |
| 22 | TCP | 您的IP | SSH（如未开放） |

---

## 7. 访问网站

浏览器打开：
```
http://47.109.178.81
```

---

## 8. 功能配置

### 8.1 短信服务 (SMS Bao)
1. 到 [smsbao.com](https://www.smsbao.com) 注册并充值
2. 登录后台 `/admin`
3. 进入 **系统设置**，添加以下配置项：
   - `sms_enabled`: `true`
   - `smsbao_username`: 您的短信宝用户名
   - `smsbao_password`: 您的短信宝密码
   - `smsbao_template`: `您的验证码是[code]，请勿泄露。`

### 8.2 客服系统
✅ **已内置，无需外部服务**
- 用户端：`/support`
- 管理员端：`/admin/support`

### 8.3 支付功能
⚠️ **当前为模拟支付**，点击支付后订单直接标记为已支付，**未调用真实支付网关**。

如需接入真实支付，需：
1. 申请 **支付宝** 或 **微信支付** 商户账号
2. 提供 `app_id`、`私钥`、`公钥` 等凭证
3. 我帮您接入真实支付 SDK

---

## 9. 后续更新代码

```bash
cd /var/www/su-ling-esports
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart su-ling-esports
```

---

## 10. 故障排查

```bash
# 查看应用日志
pm2 logs su-ling-esports

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo netstat -tlnp | grep 3000

# 重启所有服务
pm2 restart all
sudo systemctl restart nginx

# 检查 Node 版本
node -v

# 如果 CentOS 7 上 Node 18 无法运行，降级到 Node 16（不推荐，可能不兼容 Next.js 16）
# 更好的方案是升级操作系统到 Rocky Linux 8/9
```

---

## 附录：绑定域名 + SSL（Let's Encrypt）

```bash
# 安装 Certbot
sudo yum install -y certbot python2-certbot-nginx

# 申请证书（将 example.com 替换为您的域名）
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期测试
sudo certbot renew --dry-run
```

然后更新 `.env.production`：
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

重启应用：
```bash
npm run build
pm2 restart su-ling-esports
```
