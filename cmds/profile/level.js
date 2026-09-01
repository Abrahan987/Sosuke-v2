import db from "#db"

export default {
  command: ['levelup', 'level', 'lvl'],
  category: 'profile',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

    const user = await db.getUser(who)
    const allUsers = await db.getUser() || []

    if (!user)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ El usuario mencionado no está registrado en el bot.
◈──────────────◈
"La ilusión domina la realidad…"`,
      )

    const users = allUsers.map(u => ({
      ...u,
      jid: u.id
    }))

    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    const rank = sortedLevel.findIndex(u => u.jid === who) + 1

    const txt = `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
❑ Usuario › ${user.name || who.split('@')[0]}

✦ Experiencia › *${user.exp?.toLocaleString() || 0}*
卐 Nivel › *${user.level || 0}*
◈ Puesto › *#${rank}*

✦ Comandos totales › *${user.usedcommands?.toLocaleString() || 0}*
◈──────────────◈
"Todo ocurre según mi voluntad…"`

    await msg.reply(txt)
  }
}