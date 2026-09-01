import db from "#db"
import fs from 'fs';

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes === 0
    ? `${seconds} segundo${seconds > 1 ? 's' : ''}`
    : `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero','febrero','marzo','abril','mayo','junio','julio',
    'agosto','septiembre','octubre','noviembre','diciembre'
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['claim', 'c'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const userId = msg.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = await db.getChat(chatId)
    const botSettings = await db.getSettings(botId)
    const monedas = botSettings.currency
    const user = await db.getChatUser(chatId, userId)
    const now = Date.now()

    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    if (!user.buyCooldown) user.buyCooldown = 0
    const remainingTime = user.buyCooldown - Date.now()
    if (remainingTime > 0)
      return msg.reply(
        `┈┈┈〔 𖤐 〕┈┈┈
「 COOLDOWN 」
Debes esperar *${msToTime(remainingTime)}* antes de invocar *${msg.command}* nuevamente.
┈┈┈┈┈┈┈┈┈`,
      )

    if (!msg.quoted)
      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 CLAIM 」
Responde al mensaje de una waifu para reclamarla.
┈┈┈┈┈┈┈┈┈`)

    let reservedCharacter = null
    const quotedId = msg.quoted?.id

    reservedCharacter = chatConfig.personajesReservados?.find(p => p.messageId === quotedId)

    if (!reservedCharacter) {
      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 INVALID TARGET 」
Solo puedes reclamar personajes invocados mediante *rollwaifu*.
┈┈┈┈┈┈┈┈┈`)
    }

    const chatUsers = await db.getChatUser(chatId)
    const alreadyClaimed = chatUsers.find(u =>
      u.characters?.some(c => c.name?.toLowerCase() === reservedCharacter.name.toLowerCase()),
    )

    if (alreadyClaimed) {
      if (alreadyClaimed.user_id === userId)
        return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 CLAIMED 」
Ya posees a *${reservedCharacter.name}*.
┈┈┈┈┈┈┈┈┈`)

      const userData = await db.getUser(alreadyClaimed.user_id)
      const ownerName = userData?.name || alreadyClaimed.user_id.split('@')[0]

      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 CLAIMED 」
*${reservedCharacter.name}* ya pertenece a *${ownerName}*.
┈┈┈┈┈┈┈┈┈`)
    }

    if (reservedCharacter.userId && now < reservedCharacter.reservedUntil) {
      const isUserReserver = reservedCharacter.userId === userId
      const reserverData = await db.getUser(reservedCharacter.userId)
      const reserverName = reserverData?.name || reservedCharacter.userId.split('@')[0]
      const secondsLeft = ((reservedCharacter.reservedUntil - now) / 1000).toFixed(1)

      if (!isUserReserver)
        return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 PROTECTED 」
*${reservedCharacter.name}* permanece bajo la protección de *${reserverName}* durante *${secondsLeft}s*.
┈┈┈┈┈┈┈┈┈`)
    }

    if (
      reservedCharacter.expiresAt &&
      now > reservedCharacter.expiresAt &&
      !reservedCharacter.user &&
      !(reservedCharacter.userId && now < reservedCharacter.reservedUntil)
    ) {
      const expiredTime = ((now - reservedCharacter.expiresAt) / 1000).toFixed(1)

      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 EXPIRED 」
*${reservedCharacter.name}* desapareció hace *${expiredTime}s*.
┈┈┈┈┈┈┈┈┈`)
    }

    if (user.coins < reservedCharacter.value)
      return msg.reply(`┈┈┈〔 𖤐 〕┈┈┈
「 INSUFFICIENT ${monedas.toUpperCase()} 」
No posees suficientes *${monedas}* para reclamar a *${reservedCharacter.name}*.
┈┈┈┈┈┈┈┈┈`)

    user.characters = user.characters || []
    user.characters.push({
      name: reservedCharacter.name,
      value: reservedCharacter.value,
      gender: reservedCharacter.gender,
      source: reservedCharacter.source,
      keyword: reservedCharacter.keyword,
      claim: formatDate(now),
      user: userId,
    })

    const personajesReservados = chatConfig.personajesReservados.filter(
      p => p.id !== reservedCharacter.id,
    )

    await db.updateChatUser(chatId, userId, 'characters', user.characters)
    await db.updateChatUser(chatId, userId, 'buyCooldown', now + 15 * 60000)
    await db.updateChatUser(chatId, userId, 'coins', user.coins - reservedCharacter.value)
    await db.updateChat(chatId, 'personajesReservados', personajesReservados)

    const userData = await db.getUser(userId)
    const displayName = userData?.name || userId.split('@')[0]
    const duration = ((now - reservedCharacter.expiresAt + 60000) / 1000).toFixed(1)

    const frases = [
      `*${displayName}* reclamó a *${reservedCharacter.name}*. Todo ocurrió según lo previsto.`,
      `*${reservedCharacter.name}* aceptó seguir a *${displayName}* sin oponer resistencia.`,
      `*${displayName}* alteró el destino de *${reservedCharacter.name}*.`,
      `*${reservedCharacter.name}* cayó bajo una ilusión perfecta creada por *${displayName}*.`,
      `La voluntad de *${reservedCharacter.name}* ahora pertenece a *${displayName}*.`,
      `*${displayName}* obtuvo la lealtad absoluta de *${reservedCharacter.name}*.`,
      `Una nueva pieza se unió al plan de *${displayName}*: *${reservedCharacter.name}*.`,
      `*${reservedCharacter.name}* ya forma parte del dominio de *${displayName}*.`,
      `No fue suerte... *${displayName}* ya había previsto este resultado con *${reservedCharacter.name}*.`,
      `*${reservedCharacter.name}* fue guiado hasta *${displayName}* por un destino inevitable.`,
      `La ilusión terminó. *${reservedCharacter.name}* eligió a *${displayName}*.`,
      `*${displayName}* extendió su influencia sobre *${reservedCharacter.name}*.`,
      `Todo encajó a la perfección. *${reservedCharacter.name}* ahora acompaña a *${displayName}*.`,
      `El destino escribió un nuevo nombre junto al de *${reservedCharacter.name}*: *${displayName}*.`,
      `*${reservedCharacter.name}* quedó fascinada por la presencia de *${displayName}*.`
    ]

    const final = frases[Math.floor(Math.random() * frases.length)]

    await sock.reply(
      chatId,
      `┈┈┈〔 𖤐 〕┈┈┈
「 CLAIM SUCCESS 」
${final}

⌈ Tiempo: ${duration}s ⌋
┈┈┈┈┈┈┈┈┈`,
      msg,
    )
  },
}