#!/bin/bash

# 前端组件一键安装脚本
# 检查 Node.js 是否安装
if ! command -v node &> /dev/null
then
    echo "❌ 错误：未检测到 Node.js，请先安装 Node.js（推荐 18+ 版本）"
    echo "👉 下载地址：https://nodejs.org/zh-cn/download/"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null
then
    echo "❌ 错误：未检测到 npm，请确认 Node.js 安装完整"
    exit 1
fi

# 提示是否初始化 React 项目（如果是新项目）
read -p "🤔 是否需要先初始化 React 项目？(y/n，默认 n) " init_project
init_project=${init_project:-n}

if [ "$init_project" = "y" ]; then
    read -p "📛 请输入 React 项目名称（默认 react-accordion-app）: " project_name
    project_name=${project_name:-react-accordion-app}
    echo "🚀 正在初始化 React 项目..."
    npx create-react-app $project_name
    cd $project_name
    echo "✅ 进入项目目录：$project_name"
fi

# 安装核心依赖
echo "📦 正在安装核心依赖（Radix UI + Lucide）..."
npm install @radix-ui/react-accordion lucide-react --registry=https://registry.npmmirror.com

# 安装 cn 函数依赖
echo "📦 正在安装工具函数依赖（clsx + tailwind-merge）..."
npm install clsx tailwind-merge --registry=https://registry.npmmirror.com

# 创建 utils.ts 文件（如果不存在）
if [ ! -f "src/utils.ts" ]; then
    echo "📄 正在创建 src/utils.ts 文件（包含 cn 函数）..."
    mkdir -p src
    cat > src/utils.ts << EOL
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOL
    echo "✅ utils.ts 文件创建完成"
fi

echo -e "\n🎉 所有依赖安装完成！"
echo "👉 启动项目命令：npm run start"
echo "👉 如果是新创建的项目，先进入项目目录：cd $project_name && npm run start"