import db from "#db"

export default {
  command: ['count', 'mensajes', 'messages', 'msgcount'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const chatData = await db.getChat(msg.chat)

    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

    const user = await db.getChatUser(msg.chat, who)
    if (!user)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ El usuario mencionado no está registrado en el bot.
◈──────────────◈
"La ilusión domina la realidad…"`)

    const userStats = user.stats || {}
    const now = new Date()
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const days = Object.entries(userStats)
      .filter(([date]) => new Date(date) >= cutoff)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))

    const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
    const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

    let report =
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Contador de mensajes de › *@${who.split('@')[0]}*
◈──────────────◈
✐ Total en los últimos *30* días:
» Mensajes › *\`${totalMsgs}\`*
» Comandos › *\`${totalCmds}\`*
◈──────────────◈
"Todo ocurre según mi voluntad…"\n\n`

    for (const [date, d] of days) {
      const fecha = new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Bogota'
      })
      report +=
`卐 ${fecha}
» Mensajes › *\`${d.msgs || 0}\`*
» Comandos › *\`${d.cmds || 0}\`*\n`
    }

    await sock.reply(
      chatId,
      report,
      msg,
      { mentions: [who] }
    )
  }
}