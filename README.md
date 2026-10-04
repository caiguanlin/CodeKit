# CodeKit · 代码工具盒

<p align="center">
  <img src="./src/renderer/public/logo.svg" width="96" height="96" alt="CodeKit Logo" />
</p>

<p align="center">
  <strong>专为开发者打造的现代化桌面级效率工具箱</strong><br>
  本地优先 · 毫秒级响应 · 隐私安全 · 零网络依赖
</p>

---

## 🌟 核心特性

- **极客质感视觉**：无边框现代沉浸式窗口，深度支持深色/浅色极客主题。
- **本地优先 (Local-First)**：所有数据与代码处理均在本地沙箱闭环完成，输入不离本机，确保敏感研发数据绝对安全。
- **全局指令面板 (`Ctrl + F`)**：支持全域模糊匹配与键盘流极速呼出工具。
- **系统托盘与全局唤醒**：支持 `Alt + Space` 全局热键呼出、系统托盘常驻后台。
- **VS Code 同款内核**：内置 Monaco Editor 与 Monaco Diff Editor，享受工业级代码高亮、折叠、校验与差异对比。

---

## 🧰 工具矩阵 (MVP v1.0)

| 模块 | 功能亮点 | 内核引擎 |
| :--- | :--- | :--- |
| **JSON 工具盒** | 格式化（4 空格缩进）、压缩、语法校验、可折叠高亮展示与结果字号调节 | Monaco Editor / JSON Viewer |
| **时间戳转换器** | 毫秒级实时跳动时钟、10位/13位双向转换、UTC/ISO/本地时间多维解析、相对时间计算 | Day.js |
| **编解码与哈希** | Base64 编码/解码、URL Component 编解码、Unicode 中文互转、Hex 转换、MD5/SHA-1/SHA-256/SHA-512 哈希 | CryptoJS |
| **万能生成器** | ID（UUID v4 / v7、雪花 ID）批量生成、可调长度与符号集的高强度密码生成器 | UUID / Snowflake |
| **文本与正则** | 双栏 Diff 文本差异对比、正则表达式实时测试器（高亮捕获组/预设模版）、文本多维统计 | Monaco Diff Editor |
| **命名格式转换** | 自动识别空格、换行、中英文逗号或分号分隔的多个字符串，批量转换六种命名格式、点击结果逐条复制、图标按钮按格式全部复制 | 原生字符串处理 |
| **Cron 解析器** | 标准 5段/6段 Cron 表达式语法校验、自然语言中文语义解读、未来 10 次执行时间精准预测 | cron-parser |

---

## ⌨️ 常用快捷键

| 快捷键 | 功能操作 |
| :--- | :--- |
| `Ctrl + F` (或 `Cmd + F`) | 快速打开全局工具搜索面板 (Command Palette) |
| `Alt + Space` | 全局快捷键呼出 / 隐藏应用主窗口 |
| `Esc` | 退出搜索面板或弹窗 |
| `↑` / `↓` + `Enter` | 键盘快速导航与直达工具 |

---

## 🛠️ 技术栈

- **框架底座**：Electron 34 + electron-vite
- **前端核心**：Vue 3 (Composition API) + TypeScript
- **UI 组件库**：Naive UI (Dark Theme)
- **CSS 引擎**：UnoCSS (Tailwind 语法)
- **代码编辑器**：Monaco Editor (`monaco-editor`)
- **状态管理**：Pinia
- **持久化方案**：JSON Store (本地应用数据目录安全存储)
- **打包分发**：electron-builder

---

## 🚀 启动与构建

### 1. 安装依赖
```bash
pnpm install
```

### 2. 本地开发调试
```bash
pnpm dev
```

### 3. 类型检查与构建
```bash
# 类型检查
pnpm typecheck

# 生产环境打包编译
pnpm build
```

### 4. 桌面安装包分发打包
```bash
# 生成 Windows 解包目录 (免安装绿色版)
pnpm build:unpack

# 生成 Windows NSIS 安装程序
pnpm build:win
```
