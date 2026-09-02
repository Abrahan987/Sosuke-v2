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
"La ilusión domina la realidad…"`
      )
    }

    const isMp3 = args.includes('--mp3')
    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (!urls.length) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Por favor, ingresa un enlace válido de TikTok.
◈──────────────◈
"Las palabras sin base no tienen sentido…"`
      )
    }

    const url = urls[0]

    try {
      const apiUrl = `https://api.delirius.online/download/tiktok?url=${encodeURIComponent(url)}`

      const json = await fetchJson(apiUrl, {
        timeout: 25000
      })

      const data = json?.data || json

      if (!data) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontraron resultados para: ${url}
◈──────────────◈
"Todo ocurre según mi voluntad…"`
        )
      }

      const author = data.author || {}
      const music = data.music || {}
      const mediaList = data.meta?.media || []

      const media =
        mediaList.find(item => item?.type === 'video') ||
        mediaList[0] ||
        {}

      const downloadUrl =
        pickDownloadUrl(data) ||
        media.hd ||
        media.org ||
        media.wm ||
        data.download ||
        data.dl ||
        data.play

      const id = data.id || 'tiktok'
      const title = data.title || 'Sin título'
      const duration = data.duration || music.duration || 'N/A'

      const likeCount = data.like || data.repro || 0
      const commentCount = data.comment || 0
      const shareCount = data.share || 0
      const views = data.repro || data.play_count || 0

      const thumbnail =
        media?.thumbnail ||
        data?.thumb ||
        data?.thumbnail ||
        data?.cover ||
        ''

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

      if (!downloadUrl) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se pudo obtener el enlace de descarga.
◈──────────────◈
"La ilusión domina la realidad…"`
        )
      }

      if (isMp3) {
        if (thumbnail) {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: thumbnail },
              caption
            },
            { quoted: msg }
          )
        }

        const audioUrl = music.play_url || music.url || data.music_info?.url;

        if (audioUrl) {
          await sock.sendMessage(
            msg.chat,
            {
              audio: { url: audioUrl },
              mimetype: 'audio/mp4',
              fileName: `${title}.mp3`
            },
            { quoted: msg }
          )
        } else {
          await msg.reply(
            '❖ El audio directo no está disponible; enviando la versión en video…'
          )
          await sock.sendMessage(
            msg.chat,
            {
              video: { url: downloadUrl },
              mimetype: 'video/mp4',
              fileName: `${title}.mp4`
            },
            { quoted: msg }
          )
        }
      } else {
        // Flujo normal para video
        await sock.sendMessage(
          msg.chat,
          {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption
          },
          { quoted: msg }
        )
      }

    } catch (e) {
      await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${getDownloadApiErrorMessage(e)}
◈──────────────◈
"La ilusión domina la realidad…"`
      )
    }
  }
}
