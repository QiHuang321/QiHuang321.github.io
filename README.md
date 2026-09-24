# Qi Huang — 个人主页

**线上地址：<https://qihuang.me/>**（旧地址 qihuang321.github.io 会自动跳转）（仓库 `QiHuang321/QiHuang321.github.io`，push 到 main 即自动发布）

纯静态 HTML + CSS（外加几行可选的原生 JS）的个人学术主页，无需任何构建工具。关掉 JS 也能完整浏览。

## 本地预览

```bash
cd site
python3 -m http.server 8000
# 打开 http://localhost:8000
```

（直接双击 `index.html` 也能看，但字体等相对路径资源经由本地服务器加载更接近线上效果。）

## 文件结构

纯手写 HTML，CSS 内联在 `index.html` 里，无任何框架、无第三方 CDN（字体、图标、图片全部本地托管），首屏只需一个 HTML 请求。SEO 相关的标题、描述、结构化数据（JSON-LD）都在 `index.html` 的 `<head>` 里。

```
site/
├── index.html              # 唯一的页面，所有内容、样式和一小段脚本都在这里改
├── 404.html                # 404 页面（GitHub Pages 自动使用）
├── README.md
├── robots.txt / sitemap.xml
└── assets/
    ├── fonts/
    │   ├── newsreader-roman.woff2   # 正文+标题字体（Newsreader 可变字重 400–600，OFL 授权，已裁剪为拉丁字符子集）
    │   └── newsreader-italic.woff2  # 斜体（期刊名、注释等）
    ├── img/
    │   ├── portrait.jpg            # 人像 600×800（旧浏览器回退 + 结构化数据里的头像）
    │   ├── portrait-300.jpg
    │   ├── portrait-{200,300,400,600}.avif  # 现代浏览器实际加载的人像
    │   ├── share.jpg               # 1200×630 社交分享预览图（微信/LinkedIn/Slack 等链接卡片）
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

- 改内容：直接编辑 `index.html`（研究、论文、经历各区块都有清晰注释），然后 `git add -A && git commit -m "update" && git push`，一两分钟后生效。
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
- 每次更新内容后，顺手改一下页脚的 "Last updated"、`index.html` 里 JSON-LD 的 `dateModified`，以及 `sitemap.xml` 的 `<lastmod>`。
- **Research 区块的时间条**（右侧细线，所有项目共用同一刻度）：每个项目的 `<div class="tr" style="--a:2;--b:13">` 里，`--a`/`--b` 是起止月份，从 2025 年 9 月 = 0 开始数，13 = 2026 年 9 月底；进行中的项目加 `on`（末端显示箭头）。以后要把刻度往后延（比如到 2027 年），改 CSS 里 `#research{--n:13;--tick:4}` 这一处（`--n` 是刻度终点，`--tick` 是 2026 年 1 月那条刻度线），并同步改刻度文字 `Sep 2026`。
- **项目详情**：每个项目下的「Details」是原生 `<details>` 折叠块，直接改里面的 `<li>` 文字即可。
- **配色**：所有颜色都是 `index.html` 顶部 `:root` 里的变量（浅色/深色两套），深色那套写了两遍（跟随系统 + 手动切换），改的时候两处一起改。页脚的 System / Light / Dark 切换会记在浏览器里。
- **打印**：浏览器直接打印（Cmd/Ctrl+P）会得到一页纸的简版主页（隐藏导航、News 和折叠详情）。内容变多后如果超过一页，调整 `index.html` 里 `@media print` 那一段的字号/间距。
- **分享预览图** `share.jpg`：名字、头衔或研究方向改了的话需要重做一张 1200×630 的图（同名覆盖即可）。
- **字体**：只包含英文字符。名字下方的中文名「黄骑」使用系统自带的宋体显示，无需额外字体文件。
