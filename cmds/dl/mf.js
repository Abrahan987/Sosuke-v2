import db from "#db"
import { buildApiUrl, fetchJson, getDownloadApiErrorMessage, pickDownloadUrl } from '#downloads';

export default {
  command: ['mf', 'mediafire'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      let text = args.join(' ')
      if (!text) return msg.reply('✐ Ingresa una URL de Mediafire.');
      if (!/^https?:\/\/(www\.)?mediafire\.com/.test(text)) {
        return msg.reply('✦ Solo se aceptan enlaces de Mediafire.');
      }

      const json = await fetchJson(buildApiUrl('/download/mediafire', { url: text }), { timeout: 25000 });
      const payload = json?.data || json?.result || json;
      const download = pickDownloadUrl(payload) || payload?.download || payload?.file || payload?.url;

      if (!json?.status && !payload) return msg.reply('✦ No se pudo obtener el archivo.');

      const { filename, filetype, filesize, uploaded } = payload || {};

      let info = `˚ʚ♡ɞ₊ *MEDIAFIRE - DL* ෆ╹ .̮ ╹ෆ\n\n`;
      info += `➩ Descargando › *${filename || 'archivo'}*\n`;
      info += `> ❖ Tipo › *${filetype || 'archivo'}*\n`;
      info += `> ❖ Tamaño › *${filesize || 'Desconocido'}*\n`;
      info += `> ❖ Subido › *${uploaded || 'Desconocido'}*\n\n`;
      info += `⇢ Descargando y enviando archivo...`;

      await msg.reply(info)

      if (!download) return msg.reply('✦ No se pudo obtener el archivo.');

      await sock.sendMessage(
        msg.chat,
        {
          document: { url: download },
          mimetype: 'application/octet-stream',
          fileName: filename || 'mediafire-file',
        },
        { quoted: msg }
      );
    } catch (e) {
      console.error(e);
      msg.reply(getDownloadApiErrorMessage(e));
    }
  },
};