# Binance Redis Sync

CryptoSniper2.0 Redis

主要用來撈 Binance合約 K線資料到 Redis，避免因為請求太頻繁會被鎖定IP，所以用 Redis 來做快取。

## 功能特點

- 自動同步 Binance K線資料
- 使用 Redis 作為快取存儲
- Docker 容器化部署
- GitHub Actions 自動部署到 EC2

## 環境要求

- Node.js 18+
- Docker & Docker Compose
- pnpm
- Redis

## 開發環境

啟動開發環境

```
pnpm run dev
```

## 生產環境

啟動生產環境

```
pnpm run master
```

## GitHub Actions CI/CD 設定

### 設置步驟

0. 先進入 EC2 內將專案 git clone 下來
1. 在 GitHub 存儲庫中，進入 "Settings" > "Secrets and variables" > "Actions"
2. 增加以下 secrets

   - `EC2_SSH_PRIVATE_KEY`:
     ```
     -----BEGIN RSA PRIVATE KEY-----
     MIIEpAIBAAKCAQEAn4XOc6lV/PxnyhbkZJKRoWbM7O4UE3Wj+Uf5cVhNTbKZuOc4
     ...（中間內容省略）...
     NQ7n6KWpV5e4Yt9msN9s6/TJsaving6igyMQrwqRx2A8Yq5Q==
     -----END RSA PRIVATE KEY-----
     ```
   - `EC2_HOST`: `ec2-xx-xx-xx-xx.compute-1.amazonaws.com`
   - `ENV`

3. 在 GitHub 存儲庫中，進入 "Settings" > "Actions" > "General" > "Workflow permissions" 設置為 "Read and write permissions"

### 取得資料流程

1. 每5分鐘會從 Binance API 取得 標的名稱 & 24小時成交量
2. 取得資料後，依據成交量大到小排序，存入 Redis
3. 依據不時間週期，定時更新所有標的K線資料(最新的240根)
