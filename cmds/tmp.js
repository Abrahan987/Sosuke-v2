import db from "#db"
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const limpiarTmp = async () => {
  const dirs = [
    path.join(process.cwd(), 'lib', 'system', 'tmp'),
    path.join(process.cwd(), 'tmp')
  ]

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue
      const archivos = await fs.promises.readdir(dir)
      for (const archivo of archivos) {
        const ruta = path.join(dir, archivo)
        try {
          const stats = await fs.promises.stat(ruta)
          if (stats.isFile()) {
            await fs.promises.unlink(ruta)
          } else if (stats.isDirectory()) {
            await fs.promises.rm(ruta, { recursive: true, force: true })
          }
        } catch (err) {
          console.log(chalk.red(`Error eliminando ${ruta}: ${err.message}`))
        }
      }
    } catch (e) {
      // Directorio no existe o no se puede leer, ignorar
    }
  }
}

// cada 1 hora (3600000 ms)
setInterval(limpiarTmp, 3600000)
limpiarTmp()