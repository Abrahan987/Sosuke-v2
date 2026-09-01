import db from "#db"
import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply('✎ Ingrese uno o varios enlaces de *Facebook*')
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
    if (!urls.length) {
      return msg.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const json = await fetchJson(buildApiUrl('/download/facebook', { url }), { timeout: 30000 })
            const downloadUrl = pickDownloadUrl(json)
            if (downloadUrl) {
              medias.push({
                type: 'video',
                data: { url: downloadUrl }
              })
            }
          } catch (e) {
            continue
          }
        }
        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply(`✿ No se pudieron procesar los enlaces.`)
        }
      } else {
        const url = urls[0]
        const json = await fetchJson(buildApiUrl('/download/facebook', { url }), { timeout: 30000 })
        const downloadUrl = pickDownloadUrl(json)
        if (!downloadUrl) {
          return msg.reply('✿ No se pudo obtener el contenido de Facebook.')
        }

        await sock.sendMessage(
          msg.chat,
          { video: { url: downloadUrl }, mimetype: 'video/mp4', fileName: 'fb.mp4' },
          { quoted: msg }
        )
      }
    } catch (e) {
      await msg.reply(getDownloadApiErrorMessage(e))
    }
  }
}