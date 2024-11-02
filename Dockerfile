# 使用 Node.js 18 的 Alpine 版本作為基礎映像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /usr/src/app

# 安裝 pnpm
RUN npm install -g pnpm

# 複製 package.json 和 pnpm-lock.yaml到工作目錄
COPY package*.json pnpm-lock.yaml* ./

# 使用 pnpm 安裝依賴
RUN pnpm install

# 複製所有內容到工作目錄
COPY . .

# 編譯應用程式
RUN pnpm run build 

# 暴露應用程式運行的端口（如果需要）
EXPOSE 8204

# 生產環境啟動命令
CMD ["node", "dist/main"]