import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads'

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const json = await fetchJson(buildApiUrl('/download/instagram', { url }), { timeout: 25000 })
            const downloads = Array.isArray(json?.data) ? json.data : (json?.data?.download || json?.data?.downloads || json?.downloads || [])
            if (!json?.status || !downloads.length) continue
            for (const media of downloads.slice(0, 10)) {
              const mediaUrl = pickDownloadUrl(media)
              if (!mediaUrl) continue
              if (media?.type === "video" || String(media?.type || '').includes('video')) {
                medias.push({ type: "video", data: { url: mediaUrl } })
              } else {
                medias.push({ type: "image", data: { url: mediaUrl } })
              }
            }
          } catch {}
        }
        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply("✿ No se pudieron procesar los enlaces.")
        }
      } else {
        const url = urls[0]
        const json = await fetchJson(buildApiUrl('/download/instagram', { url }), { timeout: 25000 })
        const downloads = Array.isArray(json?.data) ? json.data : (json?.data?.download || json?.data?.downloads || json?.downloads || [])
        if (!json?.status || !downloads.length) {
          return sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
        }
        if (downloads.length === 1 && (downloads[0]?.type === "video" || String(downloads[0]?.type || '').includes('video'))) {
          const media = downloads[0]
          const mediaUrl = pickDownloadUrl(media)
          if (!mediaUrl) {
            return sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
          }
          await sock.sendMessage(
            msg.chat,
            { video: { url: mediaUrl }, mimetype: "video/mp4", fileName: "instagram.mp4" },
            { quoted: msg }
          )
        } else {
          const medias = []
          for (const media of downloads.slice(0, 10)) {
            const mediaUrl = pickDownloadUrl(media)
            if (!mediaUrl) continue
            if (media?.type === "video" || String(media?.type || '').includes('video')) {
              medias.push({ type: "video", data: { url: mediaUrl } })
            } else {
              medias.push({ type: "image", data: { url: mediaUrl } })
            }
          }
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        }
      }
    } catch (e) {
      await sock.reply(msg.chat, getDownloadApiErrorMessage(e), msg)
    }
  }
}