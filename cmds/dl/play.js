import ytsearch from "yt-search"
import { getBuffer } from "#serialize"
import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from "#downloads"

export default {
 command: ["play", "mp3", "ytmp3", "ytaudio", "playaudio"],
 category: "downloader",
 run: async ({ msg, sock, args }) => {
   try {
     if (!args.length) {
       return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ Por favor, menciona el nombre o URL del video que deseas descargar.
◈──────────────◈
"La ilusión domina la realidad…"`
       )
     }

     const query = args.join(" ")
     const { videos } = await ytsearch(query)

     if (!videos?.length) {
       return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se encontró información del video.
◈──────────────◈
"Todo ocurre según mi voluntad…"`
       )
     }

     const video = videos[0]
     const thumb = await getBuffer(video.image)

     const caption =
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✦ Título › *${video.title}*
卐 Canal › ${video.author?.name || video.author || "Desconocido"}
◈ Duración › ${video.timestamp || "Desconocida"}
✦ Vistas › ${(video.views || 0).toLocaleString()}
卐 Enlace › ${video.url}
◈──────────────◈
"Enviando audio, por favor espera…"`

     await sock.sendMessage(
       msg.chat,
       {
         image: thumb,
         caption
       },
       {
         quoted: msg
       }
     )

     const json = await fetchJson(buildApiUrl('/download/ytmp3', { url: video.url }), { timeout: 20000 })
     const downloadUrl = pickDownloadUrl(json)

     if (!json?.status || !downloadUrl) {
       return msg.reply(
         `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
━━ Kyōka Suigetsu ━━
◈──────────────◈
✐ No se pudo descargar el audio, intenta nuevamente.
◈──────────────◈
"El poder verdadero es la traición…"`
       )
     }

     await sock.sendMessage(
       msg.chat,
       {
         audio: {
           url: downloadUrl
         },
         mimetype: "audio/mpeg",
         fileName: `${json?.data?.title || 'audio'}.mp3`
       },       {
         quoted: msg
       }
     )

   } catch (e) {
     console.error("[PLAY ERROR]", e)

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