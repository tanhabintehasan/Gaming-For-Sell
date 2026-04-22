# 速凌电竞 - ECS 部署指南

## 1. 服务器环境准备

在阿里云 ECS (CentOS/Ubuntu) 上执行以下命令：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y   # Ubuntu
# 或
sudo yum update -y                        # CentOS

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x

# 安装 PM2 (进程管理)
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx

# 安装 Git
sudo apt install -y git
```

## 2. 配置环境变量

```bash
# 创建应用目录
mkdir -p /var/www/su-ling-esports
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

## 3. 拉取代码 & 构建

```bash
cd /var/www/su-ling-esports

# 克隆代码（如果还没克隆）
git clone https://github.com/tanhabintehasan/Gaming-For-Sell.git .

# 或者更新已有代码
git pull origin main

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移（首次部署）
npx prisma migrate deploy

# 构建生产版本
npm run build
```

## 4. 启动应用 (PM2)

```bash
cd /var/www/su-ling-esports

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 保存 PM2 配置，开机自启
pm2 save
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $HOME

# 查看状态
pm2 status
pm2 logs su-ling-esports
```

## 5. 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp /var/www/su-ling-esports/nginx-su-ling.conf /etc/nginx/sites-available/su-ling-esports

# 创建软链接
sudo ln -s /etc/nginx/sites-available/su-ling-esports /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 6. 配置阿里云安全组

在阿里云控制台 → ECS → 安全组，添加规则：
- **入方向**：允许 **TCP 80** 端口（HTTP）
- **入方向**：允许 **TCP 443** 端口（HTTPS，如果需要）
- **入方向**：允许 **TCP 3000** 端口（可选，用于直接访问调试）

## 7. 访问网站

打开浏览器访问：
```
http://47.109.178.81
```

## 8. 后续更新

当代码有更新时：

```bash
cd /var/www/su-ling-esports
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart su-ling-esports
```

## 9. 功能配置说明

### 9.1 短信服务 (SMS)
- 使用 **短信宝 (smsbao.com)**
- 登录管理后台 `/admin`
- 进入 **系统设置** → 配置以下参数：
  - `sms_enabled`: `true`
  - `smsbao_username`: 您的短信宝用户名
  - `smsbao_password`: 您的短信宝密码
  - `smsbao_template`: `您的验证码是[code]，请勿泄露。`

### 9.2 支付功能
⚠️ **当前支付为模拟支付**，点击支付后直接标记订单为已支付，**未接入真实支付网关**。

如需接入真实支付，需要：
1. 申请 **支付宝** 或 **微信支付** 商户账号
2. 获取 `app_id`、`私钥`、`公钥` 等凭证
3. 修改 `app/api/orders/[id]/pay/route.ts` 接入真实支付 SDK

### 9.3 客服系统
- 客服系统为内置工单系统，**无需外部服务**
- 用户在前台 `/support` 提交工单
- 管理员在 `/admin/support` 回复工单

## 10. 绑定域名 (可选)

1. 在域名服务商添加 A 记录指向 `47.109.178.81`
2. 修改 `nginx-su-ling.conf` 中的 `server_name`:
   ```
   server_name www.yourdomain.com yourdomain.com;
   ```
3. 申请 SSL 证书（推荐使用 Let's Encrypt + Certbot）
4. 更新 `.env.production` 中的 URL 为 HTTPS

## 故障排查

```bash
# 查看应用日志
pm2 logs su-ling-esports

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo lsof -i :3000

# 重启所有服务
pm2 restart all
sudo systemctl restart nginx
```
