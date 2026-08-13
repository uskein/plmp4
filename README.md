# 🎬 PLMP4 — Video Library

> **Reproductor de video local** construido con **Tauri + React**. Tu biblioteca de videos con progreso automático, anotaciones en la línea de tiempo y cuadernos integrados.

![Header](https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,100:f97316&height=140&section=header&text=PLMP4&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=42)

```text
 ██████╗ ██╗     ███╗   ███╗██████╗  ██████╗
 ██╔══██╗██║     ████╗ ████║██╔══██╗██╔═══██╗
 ██████╔╝██║     ██╔████╔██║██████╔╝██║   ██║
 ██╔═══╝ ██║     ██║╚██╔╝██║██╔═══╝ ██║   ██║
 ██║     ███████╗██║ ╚═╝ ██║██║     ╚██████╔╝
 ╚═╝     ╚══════╝╚═╝     ╚═╝╚═╝      ╚═════╝
```

> _Cada video es una historia. Tu biblioteca, tu reproductor._ 🎞️

---

## ✨ FEATURES · Funcionalidades

- 🎞️ **Reproductor completo** — play/pause, seek, volumen, pantalla completa
- ⏱️ **Progreso automático** — retoma la reproducción donde la dejaste (guarda cada 5s)
- 📌 **Anotaciones en la línea de tiempo** — clic en el marcador para ir al instante exacto
- 🗃️ **Carpetas / colecciones** con portadas personalizables
- 📓 **Cuadernos de notas** integrados, exportables a **PDF** y **Markdown**
- 🖼️ **Thumbnails automáticos** y duración detectada para cada video
- 🎨 **Temas visuales** editables y personalizados
- ⌨️ **Atajos de teclado** (espacio, flechas, F, M)

### ⌨️ Shortcuts

| Tecla | Acción |
|---|---|
| `Espacio` | Play / Pause |
| `←` / `→` | Retroceder / Avanzar 5s |
| `F` | Pantalla completa |
| `M` | Silenciar |

## 🛠️ TECH_GRID · Stack

[![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=000)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=fff)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=zustand&logoColor=fff)](https://zustand.docs.pmnd.rs)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=fff)](https://www.sqlite.org)

## 🚀 GET STARTED · Puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org) ≥ 18
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/start/prerequisites/)

### Desarrollo

```bash
npm install
npm run tauri dev
```

### Compilar instalador

```bash
npm run tauri build
```

O usa `dev.bat` directamente en Windows.

## 🗂️ REPO_STRUCTURE · Estructura

```
plmp4/
├── src/                  # Frontend React + TypeScript
│   ├── components/       # UI: layout, biblioteca, reproductor, cuadernos
│   ├── lib/              # Utilidades, temas y helpers Tauri
│   ├── stores/           # Estado global (Zustand)
│   └── styles/           # Estilos globales
├── src-tauri/            # Backend Rust + SQLite
│   ├── migrations/       # Esquema de base de datos
│   └── src/              # Comandos Tauri, acceso a datos y thumbnails
├── dist/                 # Build de producción
└── package.json
```

## 📡 TRANSMISSION // Contacto

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=fff)](https://github.com/uskein)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=fff)](mailto:juansebastianp188@gmail.com)

---

<p align="center">
  <sub>⚡ Video Library — parte del protocolo <b>uskein</b></sub>
</p>

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:f97316,100:0d1117&height=100&section=footer)