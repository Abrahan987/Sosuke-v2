import db from "#db"
export default {
  command: ['report', 'reporte', 'sug', 'suggest'],
  category: 'info',
  run: async ({ msg, sock, args, command }) => {
    const texto = args.join(' ').trim()
    const now = Date.now()

    try {
      const userData = await db.getUser(msg.sender)

      const cooldown = userData.sugCooldown || 0
      const restante = cooldown - now
      if (restante > 0) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Espera *${msToTime(restante)}* para volver a usar este comando.
◈──────────────◈
"La ilusión domina la realidad…"`)
      }

      if (!texto) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Debes escribir un reporte o sugerencia válida.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
      }

      if (texto.length < 10) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Tu mensaje es demasiado corto. Explica mejor tu reporte/sugerencia (mínimo 10 caracteres).
◈──────────────◈
"El poder verdadero es la traición…"`)
      }

      const fecha = new Date()
      const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const fechaLocal = fecha.toLocaleDateString('es-MX', opcionesFecha)

      const tipo = (command === 'report' || command === 'reporte') ? '卐 Reporte' : '卐 Sugerencia'
      const displayName = msg.pushName || 'Usuario desconocido'
      const numero = msg.sender.split('@')[0]

      let reportMsg =
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${tipo}
◈──────────────◈

✦ Nombre › ${displayName}
卐 Número › wa.me/${numero}
◈ Fecha › ${fechaLocal}

✦ Mensaje › ${texto}
◈──────────────◈
"La ilusión domina la realidad…"`

      try {
        await global.sock.reply('120363416930479619@g.us', reportMsg, msg)
      } catch {
        try {
          for (const nums of global.mods) {
            await sock.reply(`${nums}@s.whatsapp.net`, reportMsg, msg)
          }
        } catch {}
      }

      userData.sugCooldown = now + 24 * 60 * 60000
      await db.updateUser(msg.sender, 'sugCooldown', userData.sugCooldown)

      msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Gracias por tu ${(command === 'report' || command === 'reporte') ? 'reporte' : 'sugerencia'}.
> Tu mensaje fue enviado correctamente a los moderadores.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
    } catch {
      msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Error al procesar tu reporte/sugerencia.
◈──────────────◈
"El poder verdadero es la traición…"`)
    }
  },
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  const s = seconds.toString().padStart(2, '0')
  const msg = minutes.toString().padStart(2, '0')
  const h = hours.toString().padStart(2, '0')
  const d = days.toString()

  const parts = []
  if (days > 0) parts.push(`${d} día${d > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${h} hora${h > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${msg} minuto${msg > 1 ? 's' : ''}`)
  parts.push(`${s} segundo${s > 1 ? 's' : ''}`)

  return parts.join(', ')
}