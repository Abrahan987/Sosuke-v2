import db from "#db"
import { fetchJson, getDownloadApiErrorMessage } from '#downloads'

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
    const urls = args.filter(arg => arg.includes('tiktok.com'))

    if (urls.length) {
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
✐ No se encontraron resultados para:
${url}
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
          media.hd ||
          media.org ||
          media.wm ||
          data.download ||
          data.dl ||
          data.url ||
          null

        const thumbnail =
          media.thumbnail ||
          data.thumbnail ||
          data.thumb ||
          null

        const id = data.id || 'tiktok'
        const title = data.title || 'Sin título'
        const duration = data.duration || music.duration || 'N/A'
        const likeCount = data.like || 0
        const commentCount = data.comment || 0
        const shareCount = data.share || 0
        const views = data.repro || data.views || 0

        const authorHandle = (
          author.username ||
          author.unique_id ||
          'user'
        ).replace(/^@/, '')

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
          console.log('Respuesta API:', JSON.stringify(json, null, 2))

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
          } else {
            await msg.reply(caption)
          }

          await msg.reply(
            '❖ La descarga en MP3 no está disponible para este proveedor; se enviará el video.'
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
        } else {
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
        console.error('Error TikTok:', e)

        await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${getDownloadApiErrorMessage(e)}
◈──────────────◈
"La ilusión domina la realidad…"`
        )
      }

      return
    }

    const query = args
      .filter(arg => arg !== '--mp3')
      .join(' ')

    if (!query) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Ingresa un enlace de TikTok.
◈──────────────◈
"La ilusión domina la realidad…"`
      )
    }

    try {
      const searchUrl = `https://api.delirius.online/search/tiktok?query=${encodeURIComponent(query)}`

      const json = await fetchJson(searchUrl, {
        timeout: 25000
      })

      const results = json?.data || []

      if (!Array.isArray(results) || results.length === 0) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontraron resultados para:
${query}
◈──────────────◈
"Todo ocurre según mi voluntad…"`
        )
      }

      const result = results[0]

      const videoUrl =
        result.url ||
        result.link ||
        result.video_url ||
        null

      if (!videoUrl) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Se encontró el resultado, pero no contiene un enlace válido.
◈──────────────◈
"Todo ocurre según mi voluntad…"`
        )
      }

      const apiUrl = `https://api.delirius.online/download/tiktok?url=${encodeURIComponent(videoUrl)}`

      const downloadJson = await fetchJson(apiUrl, {
        timeout: 25000
      })

      const data = downloadJson?.data || downloadJson
      const mediaList = data?.meta?.media || []

      const media =
        mediaList.find(item => item?.type === 'video') ||
        mediaList[0] ||
        {}

      const downloadUrl =
        media.hd ||
        media.org ||
        media.wm ||
        data?.download ||
        data?.dl ||
        data?.url ||
        null

      if (!downloadUrl) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se pudo obtener el video.
◈──────────────◈
"La ilusión domina la realidad…"`
        )
      }

      const title =
        data?.title ||
        result.title ||
        'TikTok Video'

      const caption =
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Título › ${title}
卐 Resultado › ${query}
◈──────────────◈
"El poder verdadero es la traición…"`

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

    } catch (e) {
      console.error('Error búsqueda TikTok:', e)

      await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ ${getDownloadApiErrorMessage(e)}
◈──────────────◈
"El poder verdadero es la traición…"`
      )
    }
  }
}
