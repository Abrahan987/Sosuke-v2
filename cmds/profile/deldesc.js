import db from "#db"
export default {
  command: ['deldescription', 'deldesc'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const user = await db.getUser(msg.sender)
    if (!user.description) return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No tienes una descripción establecida.
◈──────────────◈
"La ilusión domina la realidad…"`,
    )

    user.description = ''
    await db.updateUser(msg.sender, 'description', user.description)

    return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Tu descripción ha sido eliminada.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
  },
};