# Qi Huang — 个人主页

纯静态 HTML + CSS 的个人学术主页，无需任何构建工具。

## 本地预览

```bash
cd site
python3 -m http.server 8000
# 打开 http://localhost:8000
```

（直接双击 `index.html` 也能看，但字体等相对路径资源经由本地服务器加载更接近线上效果。）

## 文件结构

```
site/
├── index.html              # 唯一的页面，所有内容都在这里改
├── README.md
└── assets/
    ├── site.css            # 全部样式（含深/浅色主题变量）
    ├── site.js             # 主题切换按钮逻辑
    ├── fonts/              # 自托管字体（Fraunces + Source Serif 4，latin 子集）
    ├── img/
    │   ├── portrait.jpg    # 首页人像（900×1200，由原图压缩而来）
    │   └── favicon.svg
    └── file/
        └── Qi_Huang_CV.pdf # 「CV」按钮链接的简历
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
- 换照片：将新图等比压到宽约 900px 后覆盖 `assets/img/portrait.jpg`。
- 页脚的 "Last updated" 日期记得顺手更新。
