import db from "#db"

export default {
  command: ['mantenimiento', 'maintenance', 'maint'],
  category: 'owner',
  description: 'Activa o desactiva el modo mantenimiento del bot.',
  isOwner: true,
  run: async ({ msg, sock, args, text }) => {
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await db.getSettings(botJid)

    const sub = (text || args[0] || '').toLowerCase().trim()

    if (sub === 'on' || sub === '1' || sub === 'activar') {
      if (settings.mantenimiento) {
        return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO 」
El modo mantenimiento ya se encuentra activo.
┈┈┈┈┈┈┈┈┈`)
      }

      await db.updateSettings(botJid, 'mantenimiento', 1)

      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO — ON 」
El bot ha entrado en modo mantenimiento.
Los usuarios no podrán ejecutar comandos hasta que se desactive.
┈┈┈┈┈┈┈┈┈
> "Bajo mi hipnosis, todo se detiene..."`)

    } else if (sub === 'off' || sub === '0' || sub === 'desactivar') {
      if (!settings.mantenimiento) {
        return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO 」
El modo mantenimiento no está activo.
┈┈┈┈┈┈┈┈┈`)
      }

      await db.updateSettings(botJid, 'mantenimiento', 0)

      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO — OFF 」
El bot ha salido del modo mantenimiento.
Todos los servicios han sido restablecidos.
┈┈┈┈┈┈┈┈┈
> "El orden ha sido restaurado."`)

    } else if (sub === 'status' || sub === 'estado') {
      const estado = settings.mantenimiento ? '🔴 ACTIVO' : '🟢 INACTIVO'
      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO — STATUS 」
Estado actual: ${estado}
┈┈┈┈┈┈┈┈┈`)

    } else {
      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 MANTENIMIENTO — USO 」
Usa el comando con una opción:

  ✐ .mantenimiento on — Activar
  ✐ .mantenimiento off — Desactivar
  ✐ .mantenimiento status — Ver estado

Estado actual: ${settings.mantenimiento ? '🔴 ACTIVO' : '🟢 INACTIVO'}
┈┈┈┈┈┈┈┈┈`)
    }
  }
}
