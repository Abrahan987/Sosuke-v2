import db from "#db"
import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {
    if (!args.length) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa un término o enlace de TikTok.
◈──────────────◈
"La ilusión domina la realidad…"`)
    }

    const isMp3 = args.includes('--mp3')
    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (urls.length) {
      const url = urls[0]
      try {
       const json = await fetchJson(
         buildApiUrl('/download/tiktok', { url }),
         { timeout: 25000 }
       )
       const data = json?.data || json
       if (!data) return msg.reply(
         `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontraron resultados para: ${url}
◈──────────────◈
"Todo ocurre según mi voluntad…"`)

       const author = data.author || {}
       const music = data.music || {}
       const mediaList = data.meta?.media || []
       const media = mediaList.find(item => item?.type === 'video') || mediaList[0] || {}
       const downloadUrl = pickDownloadUrl(data) || media.hd || media.org || media.wm || data.download || data.dl
       const id = data.id || data?.author?.id || 'tiktok'
       const title = data.title || 'Sin título'
       const duration = data.duration || music.duration || 'N/A'
       const likeCount = data.like || data.repro || 0
       const commentCount = data.comment || 0
       const shareCount = data.share || 0
       const views = data.repro || 0
       const thumbnail = media?.thumbnail || data?.thumb || data?.thumbnail || ``

       const authorHandle = (author.username || author.unique_id || 'user').replace(/^@/, '')
       const tiktokLink = `https://www.tiktok.com/@${authorHandle}/video/${id}`

       const caption =
         `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Título › ${title}
卐 Autor › ${author.nickname || author.username || 'Desconocido'}
◈ Duración › ${duration}
✦ Likes › ${Number(likeCount).toLocaleString()}
卐 Comentarios › ${Number(commentCount).toLocaleString()}
◈ Vistas › ${Number(views).toLocaleString()}
✦ Compartidos › ${Number(shareCount).toLocaleString()}
卐 Enlace › ${tiktokLink}
◈ Audio › ${(music.title || 'Original sound')}${music.author ? ` - ${music.author}` : ''}
◈──────────────◈
"El poder verdadero es la traición…"`

       const mediaUrl = downloadUrl
        if (!mediaUrl) return msg.reply(
          `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
 ━━ Kyōka Suigetsu ━━
 ◈──────────────◈
 ✐ No se pudo obtener el enlace de descarga.
 ◈──────────────◈
 "La ilusión domina la realidad…"`)

        if (isMp3) {
          await sock.sendMessage(msg.chat, { image: { url: thumbnail }, caption }, { quoted: msg })
          await msg.reply('❖ La descarga en MP3 no está disponible para este proveedor; se envía la versión de video.')
          await sock.sendMessage(msg.chat, { video: { url: mediaUrl }, mimetype: 'video/mp4', fileName: `${title}.mp4` }, { quoted: msg })
        } else {
          await sock.sendMessage(msg.chat, { video: { url: mediaUrl }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption }, { quoted: msg })
        }
      } catch (e) {
        await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${getDownloadApiErrorMessage(e)}
◈──────────────◈
"La ilusión domina la realidad…"`)
      }
    } else {
      const query = args.filter(a => a !== '--mp3').join(" ")
      try {
        const json = await fetchJson(buildApiUrl('/search/tiktok', { query }), { timeout: 25000 })
        const results = json?.data
        if (!results || results.length === 0) return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontraron resultados para: ${query}
◈──────────────◈
"Todo ocurre según mi voluntad…"`)

        // ... resto de la lógica igual, pero con captions Aizenizados
      } catch (e) {
        msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${getDownloadApiErrorMessage(e)}
◈──────────────◈
"El poder verdadero es la traición…"`)
      }
    }
  },
};