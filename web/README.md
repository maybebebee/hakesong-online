# 🚀 AI 美妆搭子 (AI Beauty Partner) - 黑客松项目

本项目是一个基于 AI 的智能美妆助手，旨在通过分析美妆视频内容，结合用户个人面部特征，提供结构化的化妆报告、个性化产品推荐以及 AI 妆后预览。

## 🌟 核心功能

1.  **视频分析报告**: 自动解析视频中的化妆风格、技巧、步骤及预计时长。
2.  **人脸特征识别**: 256 维度面部建模，精准抓取脸型与肤色。
3.  **智能匹配系统**: 将推荐产品与用户已有的“化妆包”进行比对。
4.  **互动跟练模式**: 沉浸式分步骤引导，带技巧要点弹窗。
5.  **AI 妆后预览**: 提前预知变美后的视觉效果。

## 🛠 技术栈

-   **框架**: Next.js 15 (App Router)
-   **样式**: Tailwind CSS
-   **动画**: Framer Motion
-   **图标**: Lucide React
-   **类型**: TypeScript

## 📦 快速开始

### 本地开发

1.  进入项目目录:
    ```bash
    cd web
    ```
2.  安装依赖:
    ```bash
    npm install
    ```
3.  启动项目:
    ```bash
    npm run dev
    ```
    访问 [http://localhost:3000](http://localhost:3000) 即可查看。

### AI 妆后预览（接入生图）

本地生成“妆后预览图”需要配置火山方舟（Ark / Seedream）的 API Key。

1. 复制环境变量模板（不要提交 `.env.local`）
    ```bash
    cp .env.local.example .env.local
    ```
2. 在 `web/.env.local` 中填写 `ARK_API_KEY`，然后重启开发服务
3. 打开页面「AI 妆后效果预览」，上传照片并点击生成

常见报错处理：

- `ModelNotOpen`：说明你的账号未开通当前 `ARK_IMAGE_MODEL` 对应的模型。请到火山方舟控制台开通该模型服务，或将 `ARK_IMAGE_MODEL` 修改为你已开通的模型 ID，然后重启 `npm run dev`。
  - 如果你已开通的是 “Doubao-Seedream-5.0-lite”，常见模型 ID 为 `doubao-seedream-5-0-260128`。

## 🌐 部署上线 (让其他人看到)

我们推荐使用 **Vercel** 进行一键部署，这是 Next.js 项目的最佳实践：

1.  **推送代码到 GitHub**:
    ```bash
    git add .
    git commit -m "🚀 Deploy to production"
    git push -u origin main
    ```
2.  **关联 Vercel**:
    -   访问 [Vercel 官网](https://vercel.com/) 并登录。
    -   点击 "Add New" -> "Project"。
    -   选择您的 GitHub 仓库 `heke-face`。
    -   点击 "Deploy"。
3.  **获取链接**: 部署完成后，Vercel 会自动为您生成一个公网可访问的 `https://...vercel.app` 链接，分享给任何人即可查看！

## 📄 文档

-   [产品需求文档 (PRD)](../.trae/documents/prd.md)
-   [技术架构文档 (Architecture)](../.trae/documents/architecture.md)

---
© 2026 Hackathon Beauty Tech Project.
