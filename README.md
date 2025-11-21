# YTRC Portal Center

YTRC Portal Center is a cross‑platform desktop application built with
**Tauri**, **React (Vite)**, and **Mantine UI**, providing a unified
access portal for YTRC internal systems such as:

- QR System\
- Cuplump Pool\
- Booking Queue\
- Weight Scale\
- Maintenance\
- Stock\
- Contact Center\
- System Settings

This application is optimized for performance, security, and ease of
navigation, using a custom-designed glass-style header and a modern
dashboard layout.

---

## 🚀 Features

### 🔐 Authentication & Permissions

- JWT-based authentication\
- Role & permission control\
- User profile modal with department, position, and permissions
  summary

### 🖥 Desktop App (Tauri)

- Native window controls (minimize, maximize, close)\
- Custom frameless header\
- Cross-platform build for Windows, macOS, and Linux\
- Secure CSP and isolation

### 🧭 Beautiful UI/UX (Mantine)

- Responsive card-based dashboard\
- Icons via Tabler Icons\
- Gradient widgets\
- Glass effect titlebar\
- Real-time clock widget\
- Smooth animations

### 🗂 Modular Portals

Each system is loaded only when needed: - Cuplump Portal\

- TruckScale Portal\
- Booking Portal\
- System Settings Portal\
- Contact Management\
- And more...

---

## 📁 Project Structure

    ytrc-portal-center/
    │── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── SimplePageHeader.jsx
    │   │   ├── portal/
    │   │   │   └── PortalCenterPage.jsx
    │   │   ├── system/
    │   │   │   └── SystemMenuPortalPage.jsx
    │   ├── helpers/
    │   │   └── http.js
    │   └── main.jsx
    │
    │── src-tauri/
    │   ├── tauri.conf.json
    │   └── Rust backend files
    │
    └── README.md

---

## 🛠 Tech Stack

Layer Technology

---

**Frontend** React + Vite
**UI Framework** Mantine UI
**Icons** Tabler Icons
**Desktop Runtime** Tauri
**State / Utilities** Axios, Custom Hooks
**Auth** JWT + Refresh Flow
**Styling** CSS Modules + Mantine Styles

---

## ⚙️ Development Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Run Dev for Desktop (Tauri)

```bash
npm run tauri dev
```

### 3️⃣ Build Production App

```bash
npm run tauri build
```

---

## 🖼 Custom Header (Glass Style)

The app uses a custom transparent header to replace the OS window bar:

```jsx
<SimplePageHeader
  title="Portal Center"
  icon={IconActivity}
  onMinimize={...}
  onMaximize={...}
  onClose={...}
/>
```

---

## 🔧 Tauri Config (Important Settings)

```json
{
  "app": {
    "windows": [
      {
        "decorations": false,
        "transparent": true,
        "resizable": true
      }
    ]
  }
}
```

---

## 🧑‍💻 Author

**Apiwat Sukjaroen (Aui)**\
YTRC Infrastructure & Digital Transformation

---

## 📄 License

This project is proprietary and internal to **YTRC**.\
Unauthorized distribution is prohibited.


ขั้นตอนต่อไปเวลาจะ build release (macOS / Windows)

ก่อนสั่ง npm run tauri build ให้ตั้ง env แบบนี้ (บน macOS / Linux):

export TAURI_SIGNING_PRIVATE_KEY="$(cat src-tauri/keys/tauri.key)"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="รหัสผ่านตอน generate"
npm run tauri build



บน Windows (PowerShell):
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content .\src-tauri\keys\tauri.key -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "รหัสผ่านตอน-generate"
npm run tauri build

