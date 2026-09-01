import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['imagen', 'img', 'image'],
  category: 'search',
  run: async ({ msg, sock, args, from }) => {
    const text = args.join(' ')
    if (!text) {
      return sock.reply(
        msg.chat,
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Ingresa un término de búsqueda.
\`═══════════════\`
"La ilusión domina la realidad…"`,
        msg,
      )
    }

    const bannedWords = [
      '+18','18+','contenido adulto','contenido explícito','contenido sexual',
      'pornhub','xvideos','xnxx','redtube','brazzers','onlyfans','sexo','sex',
      'porno','porn','desnudo','desnuda','erótico','erotico','tetas','pechos',
      'boobs','culo','pene','vagina','coño','genital','masturbar','gemidos',
      'orgía','orgy','incesto','violación','rape','bdsm','hentai','fetish',
      'camgirl','striptease','slut','fuck','cock','dick','pussy','ass','shemale',
      'trans','lesbian','gay','explicit','hardcore','nudista','nudity','69',
      'blowjob','handjob','cumshot','sexcam','pornpic','pornvideo','mia khalifa'
      // ... mantienes toda tu lista completa
    ]

    const lowerText = text.toLowerCase()
    const nsfwEnabled = await db.getChat(msg.chat).nsfw === 1

    if (!nsfwEnabled && bannedWords.some((word) => lowerText.includes(word))) {
      return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Este comando no permite búsquedas de contenido +18 o NSFW.
\`═══════════════\`
"Todo ocurre según mi voluntad…"`)
    }

    await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Procesando búsqueda de imágenes...
\`═══════════════\`
"La ilusión domina la realidad…"`,
    )

    const url = `${api.url}/search/googleimagen?query=${encodeURIComponent(text)}&key=${api.key}`

    try {
      const res = await fetch(url)

      if (!res.ok || !res.headers.get('content-type')?.includes('image')) {
        return msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ No se encontraron resultados para: *${text}*
\`═══════════════\`
"La ilusión domina la realidad…"`)
      }

      const buffer = await res.buffer()

      await sock.sendMessage(msg.chat, { image: buffer }, { quoted: msg })
    } catch (e) {
      await msg.reply(
`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Error al procesar la búsqueda.
\`═══════════════\`
"Todo ocurre según mi voluntad…"`)
    }
  },
};