# Qi Huang — 个人主页

**线上地址：<https://qihuang.me/>**（旧地址 qihuang321.github.io 会自动跳转）（仓库 `QiHuang321/QiHuang321.github.io`，push 到 main 即自动发布）

纯静态 HTML + CSS（外加几行可选的原生 JS）的个人学术主页，无需任何构建工具。关掉 JS 也能完整浏览。

## 本地预览

```bash
cd site
python3 -m http.server 8000
# 打开 http://localhost:8000
```

请从 `site/` 启动本地服务器，使 `/personal/` 和共享资源的根路径链接与线上保持一致。

## 文件结构

纯手写 HTML，无任何框架、无第三方 CDN（字体、图标、图片全部本地托管）。学术主页与个人生活页面共用基础样式和主题切换脚本，各页专用样式内联在各自 HTML 中。SEO 相关的标题、描述、结构化数据（JSON-LD）位于各页面的 `<head>`。

```
site/
├── index.html              # 学术主页：简介、研究、论文、动态和经历
├── personal/index.html     # /personal/：Outside of Research 独立页面及照片图注
├── 404.html                # 404 页面（GitHub Pages 自动使用）
├── README.md
├── robots.txt / sitemap.xml
└── assets/
    ├── css/site.css                # 两个页面共用的字体、配色、导航和页脚
    ├── js/
    │   ├── theme.js                # 两个页面共用的主题切换
    │   └── gallery.js              # 仅个人页面加载的大图浏览器
    ├── fonts/
    │   ├── newsreader-roman.woff2   # 正文+标题字体（Newsreader 可变字重 400–600，OFL 授权，已裁剪为拉丁字符子集）
    │   └── newsreader-italic.woff2  # 斜体（期刊名、注释等）
    ├── img/
    │   ├── portrait.jpg            # 人像 600×800（旧浏览器回退 + 结构化数据里的头像）
    │   ├── portrait-300.jpg
    │   ├── portrait-{200,300,400,600}.avif  # 现代浏览器实际加载的人像
    │   ├── share.jpg               # 1200×630 社交分享预览图（微信/LinkedIn/Slack 等链接卡片）
    │   ├── fitness/                # Outside of Research 相册的四张活动照片
    │   └── favicon.png / apple-touch-icon.png
    └── file/
        └── Qi_Huang_CV.pdf         # 「CV」按钮链接的简历
```

## 部署到 GitHub Pages（免费）

1. 在 GitHub 新建一个名为 `你的用户名.github.io` 的**公开**仓库（例如 `qihuang.github.io`）。
2. 把 `site/` 里的**内容**（不是 site 文件夹本身）推上去：

   ```bash
   cd site
   git init
   git add .
   git commit -m "Personal homepage"
   git branch -M main
   git remote add origin git@github.com:你的用户名/你的用户名.github.io.git
   git push -u origin main
   ```

3. 仓库 Settings → Pages 确认 Source 为 `main` 分支（`.github.io` 命名的仓库通常自动开启）。
4. 几分钟后访问 `https://你的用户名.github.io`。

### 绑定自己的域名（可选）

1. 在任意注册商（Namecheap、Cloudflare 等）买域名，约 $10–15/年。
2. 仓库 Settings → Pages → Custom domain 填入域名（会自动在仓库里生成 `CNAME` 文件）。
3. 在域名的 DNS 里加记录：
   - 顶级域（`example.com`）：4 条 A 记录指向 GitHub Pages 的 IP（185.199.108.153 / 109.153 / 110.153 / 111.153）
   - `www` 子域：1 条 CNAME 记录指向 `你的用户名.github.io`
4. 回到 Pages 设置勾选 **Enforce HTTPS**。

## 日常维护

- 改内容：学术内容编辑 `index.html`，生活内容编辑 `personal/index.html`，然后 `git add -A && git commit -m "update" && git push`，一两分钟后生效。
- 换简历：用新 PDF 覆盖 `assets/file/Qi_Huang_CV.pdf`。
- 换照片：先把新图裁成 3:4（例如 `crop.png`），再用 ImageMagick 生成各尺寸（`brew install imagemagick`）：

  ```bash
  cd assets/img
  magick crop.png -resize 600x -strip -quality 76 -interlace JPEG portrait.jpg
  magick crop.png -resize 300x -strip -quality 76 -interlace JPEG portrait-300.jpg
  magick crop.png -resize 600x -strip -quality 45 portrait-600.avif
  magick crop.png -resize 400x -strip -quality 48 portrait-400.avif
  magick crop.png -resize 300x -strip -quality 52 portrait-300.avif
  magick crop.png -resize 200x -strip -quality 54 portrait-200.avif
  ```
- 每次更新内容后，同步对应页面的页脚 "Last updated"、JSON-LD 的 `dateModified`，以及 `sitemap.xml` 中该页面的 `<lastmod>`。
- **Research 区块的时间条**（右侧细线，所有项目共用同一刻度）：每个项目的 `<div class="tr" style="--a:2;--b:13">` 里，`--a`/`--b` 是起止月份，从 2025 年 9 月 = 0 开始数，13 = 2026 年 9 月底；进行中的项目加 `on`（末端显示箭头）。以后要把刻度往后延（比如到 2027 年），改 CSS 里 `#research{--n:13;--tick:4}` 这一处（`--n` 是刻度终点，`--tick` 是 2026 年 1 月那条刻度线），并同步改刻度文字 `Sep 2026`。
- **项目详情**：每个项目下的「Details」是原生 `<details>` 折叠块，直接改里面的 `<li>` 文字即可。
- **生活相册**：位于 `/personal/`，使用 `assets/img/fitness/` 中的照片；`--focus` 控制缩略图取景，点击后显示完整照片。支持方向键切换、Esc 关闭，以及无 JavaScript 时直接打开图片。新增照片时同步填写图片尺寸、替代文字和图注。主页导航 Personal 和简介 powerlifting 都通向此页；旧链接 `/#outside-research` 会自动跳转，无 JavaScript 时落到简介入口。
- **配色**：颜色变量集中在 `assets/css/site.css` 的 `:root` 中（浅色/深色两套），深色那套写了两遍（跟随系统 + 手动切换），改的时候两处一起改。页脚的 System / Light / Dark 选择会保存在浏览器里，在两个页面间保持一致。
- **打印**：学术主页隐藏导航、News 和折叠详情；个人页面保留照片和图注，隐藏导航和大图浏览器。打印版样式分别位于两页的 `@media print` 中。
- **分享预览图** `share.jpg`：名字、头衔或研究方向改了的话需要重做一张 1200×630 的图（同名覆盖即可）。
- **字体**：只包含英文字符。名字下方的中文名「黄骑」使用系统自带的宋体显示，无需额外字体文件。
