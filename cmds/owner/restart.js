import db from "#db"
export default {
  command: ['restart'],
  category: 'mod',
  isOwner: true,
  run: async ({ msg, sock }) => {
    await sock.reply(msg.chat,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Reiniciando el Socket...
> Espere un momento...
\`═══════════════\`
"Todo ocurre según mi voluntad…"`, msg)

    setTimeout(() => {
      process.exit(0)
    }, 3000)
  },
};