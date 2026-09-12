# 9Router Topology & Quota Monitor (VS Code Extension)

VS Code Extension untuk monitoring status kuota, route aktif, dan visual dynamic mindmap topology untuk 9Router.

## 🚀 Fitur Utama

- 🦊 **Live Mindmap Topology View**: Visualisasi canvas interaktif dengan node pusat `9Router` yang terhubung ke provider (Antigravity, Claude Code, DeepSeek, Azure OpenAI, MiMo, dll).
- ⚡ **Glow Routing Animation**: Garis neon oranye/cyan yang menyala dan berdenyut (*pulse burst*) secara real-time saat routing aktif atau saat tombol test pulse ditekan.
- 📊 **Status Bar Monitor**: Widget di status bar bawah VS Code menampilkan nama provider aktif & total token yang terpakai hari ini.
- 🔍 **Interactive Provider Inspector**: Klik sembarang node provider untuk melihat detail sisa kuota, jumlah request, token prompt/completion, dan daftar model yang aktif.
- 📌 **Sidebar & Editor Panel**: Tersedia di Sidebar VS Code (Activity Bar) maupun Editor Tab penuh (`Ctrl+Shift+P` -> `9Router: Open Topology Canvas Panel`).

## 📦 Cara Build & Install

```bash
cd ~/9router-extension
npm install
npm run package
code --install-extension 9router-vscode-monitor-0.1.0.vsix
```

## ⚙️ Konfigurasi (Settings)

- `9router.baseUrl`: URL 9Router instance (default: `http://localhost:20128`).
- `9router.refreshInterval`: Interval polling data kuota dalam detik (default: `10`).
- `9router.dbPath`: Lokasi database SQLite 9Router lokal (default: `~/.9router/db/data.sqlite`).
