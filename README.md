# ✨ Aizen Bot

<div align="center">
  <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d8?auto=format&fit=crop&w=1200&q=80" alt="Aizen Bot banner" width="100%" />
</div>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-22+-brightgreen?style=for-the-badge&logo=node.js" />
  <img alt="WhatsApp" src="https://img.shields.io/badge/WhatsApp-Baileys-25D366?style=for-the-badge&logo=whatsapp" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

> Bot de WhatsApp multifuncional con estilo cyberpunk, modular y listo para administración, descarga, ocio y automatización.

## 🚀 Descripción general

Aizen Bot es un bot de WhatsApp desarrollado en Node.js con Baileys y pensado para automatizar tareas de chat, administración de grupos, búsquedas, utilidades, descargas y mini-juegos.

Cuenta con una arquitectura modular basada en comandos cargados desde `cmds/`, y está pensado para funcionar como bot personal, productivo y de entretenimiento.

### ✨ Incluye

- Descargas desde YouTube, TikTok, Instagram, Facebook, MediaFire y Spotify
- Administración de grupos
- Perfil y economía del usuario
- Stickers y packs
- Búsqueda de contenido
- Comandos de información y sistema
- IA y sub-bots
- Top de comandos más usados

---

## 🧩 Stack tecnológico

- Node.js 22+
- ESM modules (`"type": "module"`)
- Baileys para WhatsApp
- SQLite / almacenamiento local del proyecto
- Node-fetch para HTTP
- `yt-search` para búsquedas de YouTube
- API externa para descargas

---

## 🗂️ Estructura del proyecto

```text
Aizen-Bot-main/
├── cmds/                     # Comandos por categoría
│   ├── ai/
│   ├── anime/
│   ├── dl/                   # Descargas
│   ├── economy/
│   ├── grupo/
│   ├── info/
│   ├── nsfw/
│   ├── owner/
│   ├── profile/
│   ├── search/
│   ├── socket/
│   ├── sticker/
│   └── utils/
├── lib/                      # Utilidades del sistema
│   ├── system/
│   └── serialize.js
├── Sessions/                 # Credenciales y sesiones de WhatsApp
├── .topcomando               # Ranking de comandos más usados
├── database.json             # Base de datos local
├── handler.js                # Manejador principal del bot
├── index.js                  # Arranque del cliente WhatsApp
├── settings.js               # Configuración global
├── package.json              # Dependencias y scripts
├── LICENSE                   # Licencia
├── README.md                 # Documentación
├── node_modules/
└── ...
```

---

## 🛠️ Requisitos

- Node.js >= 22.13.0
- npm >= 10.9.4
- Internet activo
- WhatsApp con sesión vinculada
- Acceso a APIs externas para descargas

---

## ⚙️ Instalación

1. Clona o descarga el repositorio.
2. Abre la carpeta del proyecto.
3. Instala dependencias:

```bash
npm install
```

4. Ajusta la configuración en `settings.js`.
5. Inicia el bot:

```bash
npm start
```

---

## 🔧 Configuración

El archivo principal de configuración es:

- `settings.js`

Aquí puedes definir aspectos clave como:

- `global.api.url` → endpoint base de descargas
- `global.api.key` → clave del proveedor si aplica
- IDs de administradores
- mensajes globales
- valores del sistema

Ejemplo:

```js
global.api = {
  url: 'https://api.delirius.online/download',
  key: ''
}
```

---

## 🎮 Scripts disponibles

En `package.json` tienes estos comandos:

```bash
npm start
```

Inicia el bot principal.

```bash
npm run topcomando
```

Muestra el ranking de los comandos más usados.

---

## 📦 Categorías de comandos

### Descargas (`cmds/dl`)

- `play`, `mp3`, `ytmp3`, `ytaudio`
- `play2`, `mp4`, `ytmp4`, `ytvideo`
- `instagram`, `ig`, `reel`
- `tiktok`, `tt`
- `fb`, `facebook`
- `mf`, `mediafire`
- `sp`, `spotify`

### Información (`cmds/info`)

- `menu`
- `infobot`
- `ping`
- `status`
- `topcomando`

### Grupo (`cmds/grupo`)

- administración
- moderación
- bienvenida / salida
- configuración del grupo

### Economía (`cmds/economy`)

- trabajo
- casino
- minería
- pesca
- roulette
- ranking

### Perfil (`cmds/profile`)

- datos del usuario
- nivel
- descripción
- relaciones

### Stickers (`cmds/sticker`)

- creación de stickers
- gestión de packs
- metadata

### Búsqueda (`cmds/search`)

- YouTube
- TikTok
- Pinterest
- Wikipedia
- APK
- imágenes

### Sistema (`cmds/owner`, `cmds/socket`)

- reinicio
- mantenimiento
- subbots
- control del entorno

---

## 🌐 Nota sobre APIs de descarga

Las descargas dependen de APIs externas. Algunos endpoints pueden cambiar, caerse o devolver formatos distintos según el proveedor.

Para evitar repetir lógica, el proyecto centraliza el acceso en:

- `lib/system/downloads.js`

Esto ayuda a:

- reutilizar llamadas HTTP
- normalizar errores
- controlar timeouts
- manejar varios formatos de respuesta

---

## 🔥 Ejecutar en producción

Para usarlo en entorno real, te recomiendo:

- mantener sesiones en `Sessions/`
- revisar permisos del bot en grupos
- usar un supervisor como PM2, systemd o Docker
- monitorear logs y errores de APIs externas

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia MIT. Revisa `LICENSE` para más detalles.

---

## 👑 Créditos

Proyecto desarrollado por **ABRAHAN-M**.

---

## 🧠 Soporte

Si vas a mantener o extender el bot:

- revisa primero `cmds/`
- no cambies la lógica central sin revisar `handler.js`
- prueba los endpoints de descarga con URLs reales antes de publicar cambios

<div align="center">
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" alt="Tech illustration" width="700" />
</div>
