# 技术架构文档 (Technical Architecture) - AI 美妆搭子

## 1. 技术栈选择
- **前端框架**: React 18 (Vite 构建)。
- **样式方案**: Tailwind CSS (响应式、快速开发)。
- **动画库**: Framer Motion (提升交互流畅度)。
- **图标库**: Lucide React。
- **状态管理**: Zustand (轻量级、高性能)。
- **网络请求**: Axios (集成重试逻辑)。

## 2. 核心架构设计

### 2.1 模块划分
- **App 容器**: 路由管理与全局布局。
- **VideoAnalyzer**: 处理视频链接输入与结果展示。
- **FaceProcessor**: 负责人脸捕捉、图片上传及特征分析展示。
- **RecommendationEngine**: 逻辑层，结合视频数据与人脸数据生成建议。
- **EffectPreviewer**: 调用生图接口并展示对比。

### 2.2 数据流设计
- 用户输入视频链接 -> 调用 `analyzeVideoAPI` -> 更新 `videoState`。
- 用户上传人脸 -> 调用 `analyzeFaceAPI` -> 更新 `userFaceState`。
- 综合 `videoState` & `userFaceState` -> 调用 `generateRecommendation` -> 更新 `uiState`。

### 2.3 API 模拟方案
由于是黑客松 Demo，后端 API 采用 Mock 机制：
- `api/video/analyze`: 返回预设的结构化 JSON。
- `api/face/detect`: 模拟返回人脸参数。
- `api/image/generate`: 模拟生图过程，返回合成后的图片 URL。

## 3. 核心算法逻辑
- **人脸分析**: 模拟识别（脸型算法匹配、肤色值提取）。
- **推荐逻辑**: 基于标签权重的匹配系统（例如：视频标签 [圆脸, 冷皮] 与 用户特征 [圆脸, 冷皮] 的重合度）。

## 4. 优化策略
- **加载优化**: 关键资源预加载，懒加载非首屏组件。
- **健壮性**: Axios 拦截器处理超时与限流（HTTP 429）。
- **响应式**: 使用 Tailwind 的断点系统 (sm, md, lg) 确保完美适配。

## 5. 部署方案
- **静态部署**: 支持 Vercel/Netlify 或简单 Nginx 托管。
