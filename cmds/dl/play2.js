import yts from 'yt-search'
import { getBuffer } from '#serialize'
import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {

    try {
      if (!args[0]) {
        return msg.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text

      const search = await yts(query)
      const videoInfo = videoMatch
        ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
        : search.all[0]

      if (!videoInfo) {
        return msg.reply('《✧》 No se encontró información del video.')
      }

      const { timestamp: duration } = videoInfo
      const url = videoInfo.url
      const title = videoInfo.title
      const vistas = (videoInfo.views || 0).toLocaleString()
      const canal = videoInfo.author?.name || 'Desconocido'
      const thumbBuffer = await getBuffer(videoInfo.image)

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando video, por favor espera!*_`

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      const res = await fetchJson(buildApiUrl('/download/ytmp4', { url, quality: 'auto' }), { timeout: 25000 })
      const downloadUrl = pickDownloadUrl(res)

      if (!res?.status || !downloadUrl) {
        return msg.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

      const mensaje = {
        video: { url: downloadUrl },
        fileName: `${res?.data?.title || res?.result?.title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })
    } catch (e) {
      await msg.reply(getDownloadApiErrorMessage(e))
    }
  }
}