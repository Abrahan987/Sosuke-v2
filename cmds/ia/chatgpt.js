import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async ({ msg, sock, args, command }) => {

    const text = args.join(' ').toLowerCase()
    if (!text) {
      return msg.reply(`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Escriba una *petición* para que *ChatGPT* le responda.
\`═══════════════\`
"La ilusión domina la realidad…"`)
    }

    const apiUrl = `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`

    try {
      const { key } = await sock.sendMessage(
        msg.chat,
        { text: `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ *ChatGPT* está procesando tu respuesta...
\`═══════════════\`
"Todo ocurre según mi voluntad…"` },
        { quoted: msg },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return sock.reply(msg.chat, `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ No se pudo obtener una *respuesta* válida.
\`═══════════════\`
"La ilusión domina la realidad…"`)
      }

      const response = `${json.result}`.trim()

      await sock.sendMessage(msg.chat, {
        text: `卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
${response}
\`═══════════════\`
"Todo ocurre según mi voluntad…"`,
        edit: key
      })
    } catch (error) {
      console.error(error)
      await msg.reply(`卐卐卐 〔 AIZEN BOT 〕 卐卐卐
⧖ Kyōka Suigetsu ⧖
\`═══════════════\`
✐ Error al procesar la petición.
\`═══════════════\`
"La ilusión domina la realidad…"`)
    }
  },
};