import db from "#db"
export default {
  command: ['crime'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chat = await db.getChat(msg.chat)
    const user = await db.getChatUser(msg.chat, msg.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await db.getSettings(botId)
    const monedas = botSettings.currency

    if (chat.adminonly || !chat.rpg)
      return msg.reply(mess.comandooff)

    if (!user.crimeCooldown) user.crimeCooldown = 0
    const remainingTime = user.crimeCooldown - Date.now()

    if (remainingTime > 0) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Debes esperar *\`${msToTime(remainingTime)}\`* antes de intentar nuevamente.
◈──────────────◈
"La ilusión domina la realidad…"`)
    }

    const éxito = Math.random() < 0.5
    const cantidad = Math.floor(Math.random() * 5000)
    user.crimeCooldown = Date.now() + 10 * 60 * 1000

    await db.updateChatUser(msg.chat, msg.sender, 'crimeCooldown', user.crimeCooldown)

    const successMessages = [
      `卐 Atraco maestro › Ganaste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Hackeo exitoso › Accediste a *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Robo de joyas › Obtuviste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Venta de secretos › Ganaste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Plan maestro › Lograste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Contrabando › Te convertiste en rey y ganaste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
    ]

    const failMessages = [
      `卐 Robo fallido › Te atraparon y perdiste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Hackeo fallido › Perdiste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Disfraz roto › Te reconocieron y perdiste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Extorsión fallida › Te denunciaron y perdiste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
      `卐 Plan delatado › La policía te atrapó y perdiste *\`¥${cantidad.toLocaleString()} ${monedas}\`*`,
    ]

    const message = éxito ? pickRandom(successMessages) : pickRandom(failMessages)

    if (éxito) {
      user.coins += cantidad
    } else {
      const total = user.coins + user.bank
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad
        } else {
          const restante = cantidad - user.coins
          user.coins = 0
          user.bank -= restante
        }
      } else {
        user.coins = 0
        user.bank = 0
      }
    }

    await db.updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
    await db.updateChatUser(msg.chat, msg.sender, 'bank', user.bank)

    await sock.reply(msg.chat,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
${message}
◈──────────────◈
"El poder verdadero es la traición…"`, msg)
  },
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const min = minutes < 10 ? '0' + minutes : minutes
  const sec = seconds < 10 ? '0' + seconds : seconds

  return min === '00'
    ? `${sec} segundo${sec > 1 ? 's' : ''}`
    : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}