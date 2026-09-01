import db from "#db"
export default {
  command: ['setgenre'],
  category: 'profile',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const user = await db.getUser(msg.sender)
    const input = args.join(' ').toLowerCase()

    if (user.genre)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ya tienes un género asignado. Usa › *${prefix}delgenre* para eliminarlo.
◈──────────────◈
"La ilusión domina la realidad…"`,
      )

    if (!input)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Debes ingresar un género válido.
◈──────────────◈
"Todo ocurre según mi voluntad…"`,
      )

    const genre = input === 'hombre' ? 'Hombre' : input === 'mujer' ? 'Mujer' : null
    if (!genre)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Elige un género válido.
◈──────────────◈
"La ilusión domina la realidad…"`,
      )

    user.genre = genre
    await db.updateUser(msg.sender, 'genre', user.genre)

    return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Se ha establecido tu género como: *${user.genre}*
◈──────────────◈
"El poder verdadero es la traición…"`)
  },
};