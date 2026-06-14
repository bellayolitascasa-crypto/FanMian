# 翻面 App 试用版

这是一个移动端 Web App/PWA 试用版。它适合先给自己和朋友测试「翻面」回答质量。

重要说明：纯 GitHub Pages 不能安全保存 `OPENAI_API_KEY`，所以真实 AI 版本建议用 **GitHub 放代码 + Vercel 部署网站和 API**。这样你会得到一个公网 URL，手机随时随地都能打开。

## 本地启动

```bash
cd /Users/yxl/Documents/Codex/2026-06-13/app-ai-app/outputs/fanmian-app
OPENAI_API_KEY="你的 key" npm start
```

浏览器打开：

```text
http://localhost:4188
```

如果没有设置 `OPENAI_API_KEY`，App 会进入演示模式，能跑通流程，但回答质量不代表真实 AI 效果。

## 部署成手机随时可用的网址

### 1. 新建 GitHub 仓库

在 GitHub 新建一个仓库，比如：

```text
fanmian
```

然后把这个文件夹里的所有文件上传进去：

```text
outputs/fanmian-app
```

### 2. 用 Vercel 导入 GitHub 仓库

打开：

```text
https://vercel.com/new
```

选择刚才的 `fanmian` 仓库，保持默认配置即可。

### 3. 在 Vercel 添加环境变量

在 Vercel 项目的 Settings -> Environment Variables 里添加：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1
```

`OPENAI_MODEL` 可以不填，不填默认就是 `gpt-4.1`。

### 4. Redeploy

保存环境变量后，点一次 Redeploy。完成后 Vercel 会给你一个网址，比如：

```text
https://fanmian.vercel.app
```

这个网址就可以发给朋友在手机上测试。

## 收集反馈

每次翻面后点“像 / 不像”。如果点“不像”，可以写一句哪里不像。

点右上角“记录”，再点“复制反馈给开发者”，就能把试用记录复制出来。

## 项目结构

```text
index.html              手机页面
styles.css              样式
app.js                  前端交互和反馈记录
api/flip.mjs            Vercel 云函数
lib/flip-core.mjs       翻面提示词和 OpenAI 调用
server.mjs              本地测试服务
manifest.webmanifest    PWA 配置
```
