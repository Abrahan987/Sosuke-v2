import db from "#db"
import fs from 'fs'
import path from 'path'

export default {
  command: ['optimizar', 'opt', 'limpiar', 'cleartmp'],
  category: 'owner',
  description: 'Optimiza el bot: limpia temporales, libera RAM y compacta la base de datos.',
  isOwner: true,
  run: async ({ msg, sock }) => {
    const inicio = Date.now()
    const report = []
    let archivosEliminados = 0
    let bytesLiberados = 0

    // ── 1. Limpieza de archivos temporales ──
    const tmpDirs = [
      path.join(process.cwd(), 'lib', 'system', 'tmp'),
      path.join(process.cwd(), 'tmp')
    ]

    for (const dir of tmpDirs) {
      if (!fs.existsSync(dir)) continue
      try {
        const archivos = fs.readdirSync(dir)
        for (const archivo of archivos) {
          const ruta = path.join(dir, archivo)
          try {
            const stats = fs.statSync(ruta)
            if (stats.isFile()) {
              bytesLiberados += stats.size
              fs.unlinkSync(ruta)
              archivosEliminados++
            } else if (stats.isDirectory()) {
              const dirSize = getDirSize(ruta)
              bytesLiberados += dirSize
              fs.rmSync(ruta, { recursive: true, force: true })
              archivosEliminados++
            }
          } catch {}
        }
      } catch {}
    }
    report.push(`✐ Temporales: ${archivosEliminados} archivo(s) eliminados (${formatBytes(bytesLiberados)})`)

    // ── 2. Liberación de memoria ──
    const memAntes = process.memoryUsage()
    try {
      // Limpiar caché de metadatos de grupos
      if (typeof db.clearCache === 'function') {
        db.clearCache('user')
        db.clearCache('chat')
        db.clearCache('set')
        db.clearCache('chatuser')
        db.clearCache('packsticker')
      }
    } catch {}

    let gcResult = 'No disponible'
    if (global.gc) {
      try {
        global.gc()
        gcResult = 'Ejecutado'
      } catch {
        gcResult = 'Error al ejecutar'
      }
    }

    const memDespues = process.memoryUsage()
    const ramLiberada = Math.max(0, memAntes.heapUsed - memDespues.heapUsed)
    report.push(`✐ RAM liberada: ${formatBytes(ramLiberada)} (GC: ${gcResult})`)
    report.push(`✐ Heap actual: ${formatBytes(memDespues.heapUsed)} / ${formatBytes(memDespues.heapTotal)}`)
    report.push(`✐ RSS: ${formatBytes(memDespues.rss)}`)

    // ── 3. Compactación de base de datos ──
    const dbPath = path.join(process.cwd(), 'database.json')
    let dbStatus = 'OK'
    let dbSizeAntes = 0
    let dbSizeDespues = 0
    try {
      if (fs.existsSync(dbPath)) {
        dbSizeAntes = fs.statSync(dbPath).size
        const raw = fs.readFileSync(dbPath, 'utf8')
        const parsed = JSON.parse(raw)

        // Re-escribir compactado (con indentación limpia)
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf8')
        dbSizeDespues = fs.statSync(dbPath).size

        const diff = dbSizeAntes - dbSizeDespues
        dbStatus = diff > 0 ? `Compactada (${formatBytes(diff)} reducidos)` : 'Ya optimizada'
      }
    } catch (e) {
      dbStatus = `Error: ${e.message}`
    }
    report.push(`✐ Base de datos: ${dbStatus} (${formatBytes(dbSizeDespues || dbSizeAntes)})`)

    // ── 4. Limpieza de sesiones pre-key corruptas ──
    let sesionesLimpiadas = 0
    const sessionDirs = ['./Sessions/Owner', './Sessions/Subs']
    for (const sDir of sessionDirs) {
      if (!fs.existsSync(sDir)) continue
      try {
        const walkAndClean = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              walkAndClean(full)
            } else if (entry.name.startsWith('pre-key-') || entry.name.startsWith('sender-key-')) {
              try {
                const stats = fs.statSync(full)
                // Solo eliminar si tiene más de 7 días y es menor a 100 bytes (probablemente corrupto)
                const ageDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24)
                if (ageDays > 7 && stats.size < 100) {
                  fs.unlinkSync(full)
                  sesionesLimpiadas++
                }
              } catch {}
            }
          }
        }
        walkAndClean(sDir)
      } catch {}
    }
    if (sesionesLimpiadas > 0) {
      report.push(`✐ Sesiones: ${sesionesLimpiadas} pre-keys antiguas limpiadas`)
    }

    // ── Reporte final ──
    const elapsed = Date.now() - inicio

    const botName = sock.user.name || 'Aizen Bot'
    const uptime = formatUptime(process.uptime())

    await msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 OPTIMIZACIÓN COMPLETADA 」
Bot: ${botName}
Uptime: ${uptime}
Tiempo de ejecución: ${elapsed}ms
┈┈┈┈┈┈┈┈┈
${report.join('\n')}
┈┈┈┈┈┈┈┈┈
> "Todo funciona bajo mi control perfecto."`)
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getDirSize(dirPath) {
  let size = 0
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name)
      if (entry.isFile()) {
        size += fs.statSync(full).size
      } else if (entry.isDirectory()) {
        size += getDirSize(full)
      }
    }
  } catch {}
  return size
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}
