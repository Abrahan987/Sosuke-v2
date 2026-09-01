import db from "#db"
export default {
  command: ['dep', 'deposit', 'd'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    const chatData = await db.getChat(msg.chat)
    const user = await db.getChatUser(msg.chat, msg.sender)
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await db.getSettings(idBot)
    const monedas = settings.currency

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff)

    if (!args[0]) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa la cantidad de *\`${monedas}\`* que quieras *depositar*.
◈──────────────◈
"La ilusión domina la realidad…"`)
    }

    if (args[0] < 1 && args[0].toLowerCase() !== 'all') {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa una cantidad *válida* para depositar.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
    }

    if (args[0].toLowerCase() === 'all') {
      if (user.coins <= 0)
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No tienes *\`${monedas}\`* para depositar en tu banco.
◈──────────────◈
"El poder verdadero es la traición…"`)

      const count = user.coins
      user.coins = 0
      user.bank += count

      await db.updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
      await db.updateChatUser(msg.chat, msg.sender, 'bank', user.bank)

      await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Has depositado *\`¥${count.toLocaleString()} ${monedas}\`* en tu banco.
◈──────────────◈
"La ilusión domina la realidad…"`)
      return true
    }

    if (!Number(args[0]) || parseInt(args[0]) < 1) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa una cantidad *válida* para depositar.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
    }

    const count = parseInt(args[0])
    if (user.coins <= 0 || user.coins < count) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No tienes suficientes *\`${monedas}\`* para depositar.
◈──────────────◈
"La ilusión domina la realidad…"`)
    }

    user.coins -= count
    user.bank += count

    await db.updateChatUser(msg.chat, msg.sender, 'coins', user.coins)
    await db.updateChatUser(msg.chat, msg.sender, 'bank', user.bank)

    await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Has depositado *\`¥${count.toLocaleString()} ${monedas}\`* en tu banco.
◈──────────────◈
"El poder verdadero es la traición…"`)
  },
};