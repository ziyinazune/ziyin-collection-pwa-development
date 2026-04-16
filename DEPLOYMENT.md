# GitHub Pages 部署指南

## 📋 前置准备

你的 GitHub ID: **ziyinazune**

## 🚀 部署步骤

### 第一步：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 仓库名称填写：`ziyin-collection-pwa-development`
3. 设置为 **Public**（公开仓库）
4. **不要** 勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 第二步：初始化 Git 并推送代码

在项目根目录打开终端，依次执行以下命令：

```bash
# 初始化 git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/ziyinazune/ziyin-collection-pwa-development.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

> 💡 **提示**：如果推送时需要认证，可以使用 GitHub Personal Access Token 或者配置 SSH key。

### 第三步：部署到 GitHub Pages

执行以下命令自动构建并部署：

```bash
npm run deploy
```

这个命令会：
1. 先执行 `npm run build` 构建项目
2. 然后将构建产物推送到 `gh-pages` 分支

### 第四步：配置 GitHub Pages

1. 访问你的仓库：https://github.com/ziyinazune/ziyin-collection-pwa-development
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**
4. 在 "Build and deployment" 部分：
   - Source 选择：**Deploy from a branch**
   - Branch 选择：**gh-pages** 分支
   - Folder 选择：**/(root)**
5. 点击 **Save**

### 第五步：访问你的网站

等待几分钟让 GitHub Pages 完成部署，然后访问：

🌐 **https://ziyinazune.github.io/ziyin-collection-pwa-development/**

## 🔄 更新部署

每次修改代码后，只需执行：

```bash
# 1. 提交代码更改
git add .
git commit -m "描述你的更改"
git push

# 2. 重新部署
npm run deploy
```

## ⚠️ 常见问题

### 1. 页面显示 404
- 检查 `vite.config.ts` 中的 `base` 配置是否正确
- 确认仓库名称与 base 路径一致
- 等待 5-10 分钟让 GitHub Pages 完成部署

### 2. 样式或资源加载失败
- 清除浏览器缓存
- 检查浏览器控制台的错误信息
- 确认所有资源路径都是相对路径

### 3. 推送代码时认证失败
- 使用 GitHub Personal Access Token：https://github.com/settings/tokens
- 或者配置 SSH key：https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## 📝 项目配置说明

已为你配置好的内容：

1. **vite.config.ts**
   ```typescript
   base: '/ziyin-collection-pwa-development/'
   ```

2. **package.json**
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **依赖**
   - 已安装 `gh-pages` 用于自动化部署

## 🎉 完成！

按照以上步骤操作后，你的 Vite + React 应用就成功部署到 GitHub Pages 了！

如有问题，可以随时询问。
