import db from "#db"
export default {
  command: ['ping', 'p'],
  category: 'info',
  run: async ({ msg, sock }) => {
    const start = Date.now()
    const settings = await db.getSettings(sock.user.id.split(':')[0] + "@s.whatsapp.net")
    const botname = settings.namebot

    const sent = await sock.sendMessage(
      msg.chat,
      { text:
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ¡Pong!
> *${botname}*
◈──────────────◈
"La ilusión domina la realidad…"` },
      { quoted: msg }
    )

    const latency = Date.now() - start

    await sock.sendMessage(
      msg.chat,
      { text:
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Pong!
> Tiempo ⴵ ${latency}ms
◈──────────────◈
"Todo ocurre según mi voluntad…"`,
        edit: sent.key },
      { quoted: msg }
    )
  },
};