import db from "#db"

let proposals = {}

export default {
  command: ['marry'],
  category: 'profile',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const proposer = msg.sender
    const mentioned = msg.mentionedJid
    const proposee = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : false)

    if (!proposee) return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Menciona al usuario al que deseas proponer matrimonio.
◈──────────────◈
"La ilusión domina la realidad…"`,
    )

    if (proposer === proposee)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No puedes proponerte matrimonio a ti mismo.
◈──────────────◈
"Todo ocurre según mi voluntad…"`,
      )

    const proposerData = await db.getUser(proposer)
    const proposeeData = await db.getUser(proposee)

    if (proposerData?.marry)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ya estás casado con *${db.getUser(proposerData.marry)?.name || 'alguien'}*.
◈──────────────◈
"La ilusión domina la realidad…"`,
      )

    if (proposeeData?.marry)
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ *${proposeeData.name || proposee.split('@')[0]}* ya está casado con *${db.getUser(proposeeData.marry)?.name || 'alguien'}*.
◈──────────────◈
"Todo ocurre según mi voluntad…"`,
      )

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]

      proposerData.marry = proposee
      proposeeData.marry = proposer

      await db.updateUser(msg.sender, 'marry', proposerData.marry)
      await db.updateUser(proposee, 'marry', proposeeData.marry)

      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Felicidades, *${proposerData.name || proposer.split('@')[0]}* y *${proposeeData.name || proposee.split('@')[0]}* ahora están casados.
◈──────────────◈
"El poder verdadero es la traición…"`)
    } else {
      proposals[proposer] = proposee
      return sock.reply(
        chatId,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ @${proposee.split('@')[0]}, el usuario @${proposer.split('@')[0]} te ha enviado una propuesta de matrimonio.

✦ Responde con:
> ◈ *_marry @${proposer.split('@')[0]}_* para confirmar.
> ◈ La propuesta expirará en 2 minutos.
◈──────────────◈
"La ilusión domina la realidad…"`,
        msg,
        { mentions: [proposer, proposee] }
      )
    }
  }
}