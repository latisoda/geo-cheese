# 硬糖的地理芝士 · 地理教师备课教研一体化工作台

一个面向中学地理教师的**纯静态、零依赖**专业工作台：备课、授课、反思、教研、班级成绩、教材资源、教学案生成、科普插图、地理讲义，全部在浏览器本地运行，**无需联网、无需服务器、可一键托管到 GitHub Pages**。

> 命名源自一位地理老师的巧思——「芝士」即「知识」。

## ✨ 功能模块

| 页面 | 文件 | 说明 |
|---|---|---|
| 主工作台 | `index.html` | 总目录 + 四大模块（备课/授课/反思/教研）+ 班级成绩分析 + 上传·分析·汇总中心 + 模板库 + 听评课看板与学期日历 |
| 教材资源包 | `textbooks.html` | 人教版/鲁教版/湘教版/中图版四版按册·章·节拆解 + 国外《科学发现者》+ 四版对照表 + 我的标注 |
| 教学案生成器 | `lesson-planner.html` | 选主题 + 教材版本，跨版融合生成**教师教学案**与**学生导学案**（必修+选必全覆盖），可导出 Word |
| 科普插图生成器 | `science-illustration.html` | 浏览器内 SVG 矢量插图（9 个地理主题，可动画、零额度），可下载 `.svg` |
| 地理讲义中心 | `lecture-notes.html` | 真实可用的地理讲义（水循环 / 大气环流与气候 / 人口迁移等），含课标、核心知识点、重难点、教学过程、板书、配套资源 |

## 🚀 本地使用

直接用浏览器打开 `index.html` 即可。所有数据默认保存在浏览器 `localStorage`（标注、成绩、听评课、收藏插图等），不上传任何服务器。

## 🌐 部署到 GitHub Pages（免费托管为网站）

本机已预装 **GitHub CLI v2.103.3**（`~/.workbuddy-ai/binaries/gh/gh.exe`，已加入用户 PATH）。你只需完成一次登录：

```bash
gh auth login          # 选 GitHub.com → HTTPS → 用浏览器登录
```

然后**一条命令**发布（脚本会自动提交改动、建仓/推送、开启 Pages）：

```bash
./deploy.sh            # 发布到公开仓库 geo-cheese
./deploy.sh 你的仓库名   # 自定义仓库名
```

> 若 `gh` 命令在你的终端里找不到，重开一个终端窗口即可（PATH 变更需重启进程生效）。

**手动等价步骤**：

```bash
gh repo create geo-cheese --public --source=. --remote=origin --push
# 仓库 Settings → Pages → Source 选择 "main" 分支 / (root)
```

> 由于根目录已是静态 HTML 且包含 `.nojekyll`，GitHub 不会用 Jekyll 处理，直接以静态站点发布。稍候 1–2 分钟即可获得 `https://<你的用户名>.github.io/geo-cheese/` 永久访问地址。

## 📁 目录结构

```
.
├── index.html                 主工作台
├── textbooks.html             教材资源包
├── lesson-planner.html        教学案生成器
├── science-illustration.html  科普插图生成器
├── lecture-notes.html         地理讲义中心
├── assets/
│   ├── style.css              全局样式（含移动端适配）
│   └── app.js                 交互逻辑（localStorage 持久化）
├── .nojekyll                  GitHub Pages 关闭 Jekyll
└── README.md                  本文件
```

## 🗺️ 路线图

- [x] 备课 / 授课 / 反思 / 教研 四大模块
- [x] 班级成绩分析（分布图）
- [x] 教材资源包（四版 + 国外 + 对照 + 标注）
- [x] 教学案生成器（教师案 + 学生案 + 导出 Word）
- [x] 科普插图（SVG 可动画）
- [x] 听评课看板 + 学期日历
- [x] 地理讲义中心
- [ ] 云端同步（云存储 / AI 分析 / 数据库）—— 待云服务开通

---

由 WorkBuddy AI 协助构建 · 仅供教学使用
