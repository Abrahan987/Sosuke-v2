import db from "#db"
import { buildApiUrl, fetchBinary, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads'
import { getBuffer } from "#serialize"

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply('✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify')
      }

      const query = args.join(' ')
      let url, songInfo

      if (/open\.spotify\.com\/track\//i.test(query)) {
        url = query
        const resultInfo = await fetchJson(buildApiUrl('/download/spotify', { url }), { timeout: 25000 })
        if (!resultInfo?.status) return msg.reply('❖ No se pudo procesar el enlace de Spotify.')
        songInfo = resultInfo.data || resultInfo
      } else {
        const data = await fetchJson(buildApiUrl('/search/spotify', { query }), { timeout: 25000 })
        if (!data?.status || !data.data?.length) {
          return msg.reply('❖ No se encontraron resultados en Spotify')
        }
        songInfo = data.data[0]
        url = songInfo.url
      }

      const duracion = (!songInfo.duration || songInfo.duration.includes('NaN'))
        ? 'Desconocida'
        : songInfo.duration || ""

      const caption = `➪ Descargando › ${songInfo.title || songInfo.name}

> ✿⃘࣪◌ ֪ Artista › ${songInfo.artist || ""}
> ✿⃘࣪◌ ֪ Álbum › ${songInfo.album || ""}
> ✿⃘࣪◌ ֪ Fecha › ${songInfo.publish || songInfo.year}
> ✿⃘࣪◌ ֪ Duración › ${duracion || ""}
> ✿⃘࣪◌ ֪ Enlace › ${url || ""}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      let yi = songInfo.image || songInfo.cover

      await sock.sendMessage(msg.chat, { image: { url: yi }, caption }, { quoted: msg })

      const resultAudio = await fetchJson(buildApiUrl('/download/spotify', { url }), { timeout: 25000 })
      const audioUrl = pickDownloadUrl(resultAudio) || resultAudio?.data?.dl || resultAudio?.dl
      if (!resultAudio?.status || !audioUrl) {
        return msg.reply('❖ No se pudo descargar el audio de Spotify.')
      }

      const audioBuffer = await fetchBinary(audioUrl, { timeout: 30000 })

const mensaje = {
  document: audioBuffer,
  mimetype: "audio/mpeg",
  fileName: `${resultAudio.data.title || 'music'}.mp3`
};

await sock.sendMessage(msg.chat, mensaje, { quoted: msg });

    } catch (e) {
      await msg.reply(getDownloadApiErrorMessage(e))
    }
  }
}