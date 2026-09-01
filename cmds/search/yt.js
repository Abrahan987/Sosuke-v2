import db from "#db"
import yts from 'yt-search';
import {getBuffer} from '#serialize';

export default {
  command: ['ytsearch', 'search'],
  category: 'internet',
  run: async ({ msg, sock, args }) => {
    if (!args || !args[0]) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingrese el *título* de un *vídeo*.
◈──────────────◈
"La ilusión domina la realidad…"`,
      )
    }

    await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Procesando búsqueda en YouTube...
◈──────────────◈
"Todo ocurre según mi voluntad…"`,
    )

    const ress = await yts(`${args[0]}`)
    const armar = ress.all
    const Ibuff = await getBuffer(armar[0].image)

    let teks2 = armar
      .map((v) => {
        switch (v.type) {
          case 'video':
            return `✦ Título › *${v.title}*

◈ Duración › ${v.timestamp}
卐 Subido › ${v.ago}
✦ Vistas › ${v.views}
◈ Url › ${v.url}`
          case 'channel':
            return `✦ Canal › *${v.name}*
◈ Url › ${v.url}
卐 Subscriptores › ${v.subCountLabel} (${v.subCount})
✦ Videos totales › ${v.videoCount}`
        }
      })
      .filter((v) => v)
      .join('\n\n◈──────────────◈\n\n')

    const caption = `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Resultados de búsqueda en YouTube
◈──────────────◈
"El poder verdadero es la traición…"\n\n${teks2}`

    sock.sendMessage(msg.chat, { image: Ibuff, caption }, { quoted: msg }).catch((err) => {
      msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Error al procesar la búsqueda en YouTube.
◈──────────────◈
"La ilusión domina la realidad…"`)
    })
  },
};