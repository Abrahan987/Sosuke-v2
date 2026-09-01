import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['ams', 'applemusicsearch'],
  category: 'search',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Por favor, menciona el nombre de la canción que deseas buscar en Apple Music.
◈──────────────◈
"La ilusión domina la realidad…"`)
      }

      const query = args.join(' ')
      const res = await fetch(`${api.url}/search/applemusic?query=${encodeURIComponent(query)}&key=${api.key}`)
      const result = await res.json()

      if (!result.status || !result.data?.length) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontraron resultados en Apple Music para: *${query}*
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
      }

      let texto = `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Resultados de Apple Music para: *${query}*
◈──────────────◈
"El poder verdadero es la traición…"\n\n`

      result.data.forEach((song, i) => {
        texto += `✦ ${i + 1}. *${song.title}*\n`
        texto += `   ◈ Artista: ${song.artist}\n`
        texto += `   卐 Álbum: ${song.album}\n`
        texto += `   ✦ Enlace: ${song.url}`
        if (i !== result.data.length - 1) texto += `\n\n◈──────────────◈\n\n`
      })

      const firstSong = result.data[0]
      const audioRes = await fetch(firstSong.preview)
      if (!audioRes.ok) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Error al obtener el archivo de audio.
◈──────────────◈
"La ilusión domina la realidad…"`)
      }
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

      await sock.sendMessage(msg.chat, {
        image: { url: firstSong.thumbnail },
        caption: texto
      }, { quoted: msg })

    } catch (e) {
      await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Error al procesar la búsqueda en Apple Music.
◈──────────────◈
"Todo ocurre según mi voluntad…"`)
    }
  }
}