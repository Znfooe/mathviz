#!/usr/bin/env bash
# 数学之美 · 交互式数学可视化平台 —— macOS / Linux 启动脚本
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  [错误] 未检测到 Node.js。"
  echo "  请先安装 Node.js（LTS 版本）: https://nodejs.org/"
  echo "  macOS 也可使用:  brew install node"
  echo "  Ubuntu/Debian:  sudo apt install nodejs"
  echo ""
  exit 1
fi

node server.js
