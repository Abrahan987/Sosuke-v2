import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async ({ msg, sock, args, from }) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Ingresa un *término* de búsqueda o un enlace de *Pinterest*.
\`═══════════════\`
"La ilusión domina la realidad…"`,
      )
    }

    try {
      if (isPinterestUrl) {
        const pinterestUrl = `${api.url}/dl/pinterest?url=${text}&key=${api.key}`
        const ress = await fetch(pinterestUrl)
        if (!ress.ok) throw new Error(`La API devolvió un código de error: ${ress.status}`)

        const { data: result } = await ress.json()
        const mediaType = ['image', 'video'].includes(result.type) ? result.type : 'document'

        await sock.sendMessage(
          msg.chat,
          { [mediaType]: { url: result.dl }, caption:
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Resultado obtenido desde Pinterest.
\`═══════════════\`
"Todo ocurre según mi voluntad…"` },
          { quoted: msg },
        )
      } else {
        const pinterestAPI = `${api.url}/search/pinterest?query=${text}&key=${api.key}`
        const res = await fetch(pinterestAPI)
        if (!res.ok) throw new Error(`La API devolvió un código de error: ${res.status}`)

        const jsons = await res.json()
        const results = jsons.data

        if (!results || results.length === 0) {
          return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ No se encontraron resultados para *${text}*.
\`═══════════════\`
"La ilusión domina la realidad…"`)
        }

        const medias = []
        for (const result of results.slice(0, 10)) {
          const caption =
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Pinterest Search Result
\`═══════════════\`
${result.title ? `✿ Título › *${result.title}*\n` : ''}${result.description ? `❀ Descripción › *${result.description}*\n` : ''}${result.full_name ? `❑ Autor › *${result.full_name}*\n` : ''}${result.likes ? `♡ Likes › *${result.likes}*\n` : ''}${result.created ? `✤ Publicado › *${result.created}*` : ''}
\`═══════════════\`
"Todo ocurre según mi voluntad…"`

          medias.push({
            type: 'image',
            data: { url: result.hd || result.url },
            caption
          })
        }

        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ No se pudieron procesar los resultados.
\`═══════════════\`
"La ilusión domina la realidad…"`)
        }
      }
    } catch (e) {
      await sock.reply(
        msg.chat,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Error al procesar la búsqueda en Pinterest.
\`═══════════════\`
"Todo ocurre según mi voluntad…"`,
        msg
      )
    }
  },
}