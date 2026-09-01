import db from "#db"
export default {
  command: ['delbirth'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const user = await db.getUser(msg.sender)
    if (!user.birth) return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No tienes una fecha de nacimiento establecida.
◈──────────────◈
"La ilusión domina la realidad…"`,
    )

    user.birth = ''
    await db.updateUser(msg.sender, 'birth', user.birth)

    return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Tu fecha de nacimiento ha sido eliminada.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
  },
};