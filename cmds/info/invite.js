import db from "#db"
function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100)
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${minutes} Minuto(s) ${seconds} Segundo(s)`
}

const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+[0-9]{1,3})?/i

async function getGroupName(sock, chatId) {
  try {
    const metadata = await sock.groupMetadata(chatId)
    return metadata.subject || 'Grupo desconocido'
  } catch {
    return 'Chat privado'
  }
}

export default {
  command: ['invite', 'invitar'],
  category: 'info',
  run: async ({ msg, sock, args }) => {
    const grupo = msg.isGroup ? await getGroupName(sock, msg.chat) : 'Chat privado'

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await db.getSettings(botId)
    const botname = botSettings.namebot2

    const link = args.join(' ')
    const match = link.match(linkRegex)
    if (!match || !match[1]) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ El enlace ingresado no es válido o está incompleto.
◈──────────────◈
"La ilusión domina la realidad…"`)
    }

    if (!args || !args.length) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa el enlace para invitar al bot a tu grupo.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
    }

    const isOficialBot = botId === global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : ''
    const isPremiumBot = botSettings?.botprem === 1
    const isModBot = botSettings?.botmod === 1

    const botType = isOficialBot
      ? 'Owner'
      : isPremiumBot
        ? 'Premium'
        : isModBot
          ? 'Main'
          : 'Sub Bot'

    const sugg = `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Solicitud Recibida
◈──────────────◈
"La ilusión domina la realidad…"\n\n

✦ Usuario › ${msg.pushName}
卐 Enlace › ${args.join(' ')}
◈ Chat › ${grupo}

✦ Información del Bot
卐 Socket › ${botType}
◈ Nombre › ${botname}
✦ Versión › @latest`

    if (typeof sugg !== 'string' || !sugg.trim()) return

    for (const num of global.mods) {
      const jid = `${num}@s.whatsapp.net`
      try {
        await sock.sendMessage(jid, { text: sugg })
      } catch (e) {
        msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se pudo enviar la solicitud a ${jid}.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
      }
    }

    await sock.reply(
      msg.chat,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Enlace de invitación enviado con éxito a los Desarrolladores.
◈──────────────◈
"El poder verdadero es la traición…"`,
      msg,
    )
  },
};