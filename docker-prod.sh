#!/bin/bash

docker-compose down

# 清理未使用的 Docker 資源
echo "Cleaning up Docker resources..."
docker system prune -f

# 構建並啟動開發容器
echo "Building and starting development container..."
docker-compose up --build -d

