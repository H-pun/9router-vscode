# 9Router for Visual Studio Code

[![Release](https://img.shields.io/github/v/release/H-pun/9router-vscode?style=flat-square&color=orange)](https://github.com/H-pun/9router-vscode/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Native VS Code sidebar extension for monitoring and managing [9Router](https://github.com/decolua/9router) — real-time AI quota tracking, interactive `@xyflow/react` routing topology graph, token burn rate analytics, and live streaming request logs directly inside your code editor.

---

## 🚀 Key Features

### 1. 📊 Native Quota Tracker (1:1 with Web UI)
- **Account & Provider Grouping**: Hierarchical tree view grouping accounts under official provider identities (`Antigravity`, `Claude Code`, `DeepSeek`, `Azure OpenAI`, etc.).
- **Curated Quota Buckets**: Displays consolidated model quotas (`Gemini Flash / Pro`, `Claude Sonnet / Opus`, `GPT-OSS 120B`, `Gemini 3.1 Flash Image`, and `Weekly Caps`).
- **Live Progress & Countdown**: Real-time remaining percentage bars, usage ratios (`used / total`), and relative reset countdown timers (`in 2d 14h`).
- **Inline Controls**: Instant account activation switch (`Active / Turn Off`), connection validation (`zap`), and individual quota sync.
- **Account Filter**: Filter dropdown menu (`Active (Default)`, `All Accounts`, `Inactive / Turn Off`).

### 2. ⚡ Live Routing Topology Graph (`@xyflow/react`)
- **1:1 Official React Flow Canvas**: Interactive radial graph centered around the 9Router core node.
- **Electric Plasma & Particle Streams**: Bezier curve edges with turbulent plasma glow and high-speed energy particles that ignite during active requests.
- **Responsive Typography**: Node sizing and typography adapt dynamically to VS Code's active font settings (`var(--vscode-font-size)`).

### 3. 📈 Token & Cost Analytics (`recharts`)
- **Smooth Spline Area Chart**: Visualize daily token consumption and cost burn rates.
- **Dual View Modes**: Seamlessly toggle between **Tokens** (Purple `#818cf8`) and **Cost** (Amber `#fbbf24`).
- **Flexible Ranges**: Switch between `TODAY`, `24H`, `7D`, and `30D` time windows.

### 4. 🛰️ Real-Time Request Streaming (SSE)
- **Zero-Latency Stream**: Powered by 9Router's Server-Sent Events (`/api/usage/stream`).
- **Detailed Telemetry**: Displays model name, input/output token counts (`Prompt ↑ / Completion ↓`), and relative execution timestamps.

### 5. 🎨 100% Theme Adaptive
- Built strictly using official VS Code theme variables (`--vscode-*`) and `@vscode/codicons`.
- Fully supports Dark, Light, and High Contrast themes.

---

## 📦 Installation

### From GitHub Releases (VSIX):
1. Download the latest `.vsix` package from the [Releases](https://github.com/H-pun/9router-vscode/releases) page.
2. In VS Code, open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Click the `...` (Views and More Actions) menu in the top-right corner of the Extensions sidebar.
4. Select **Install from VSIX...** and choose the downloaded file.

*Or install via terminal:*
```bash
code --install-extension 9router-vscode-1.0.1.vsix
```

---

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,` / `Cmd+,`) and search for `9router`:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `9router.baseUrl` | `string` | `http://localhost:20128` | Base URL or IP of your 9Router server instance. |
| `9router.apiKey` | `string` | `""` | API Key / Bearer token (required for remote instances, auto-read locally). |
| `9router.refreshInterval` | `number` | `900` | Quota auto-sync interval in seconds (default: 15 minutes). |

You can also use the built-in **Settings Wizard** by clicking the `⚙` gear icon in the 9Router sidebar title bar.

---

## 🛠️ Development & Build

```bash
# Clone repository
git clone https://github.com/H-pun/9router-vscode.git
cd 9router-vscode

# Install dependencies
npm install

# Compile TypeScript & bundle React apps with esbuild
npm run compile
npm run build

# Package extension as VSIX
npx @vscode/vsce package --no-dependencies
```

---

## 📄 License

MIT © [Harpun](https://github.com/H-pun)
