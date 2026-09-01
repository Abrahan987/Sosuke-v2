
import { normalizeJid, resolveParticipantJid, resolveJidSync, deleteCachedMeta, getCachedMeta, setCachedMeta } from '#serialize';
import db from "#db";
import chalk from 'chalk';
import moment from 'moment-timezone';

function getGroupAdmins(participants) {
  return (participants ?? [])
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)
    .filter(Boolean);
}

function resolveEventParticipant(p, sock) {
  if (typeof p === 'string') return resolveJidSync(p, sock) || p;
  return resolveParticipantJid(p, sock) || normalizeJid(p.id || p.phoneNumber || p.jid || p.lid || '') || '';
}

export default async (sock, msg) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (['add', 'remove', 'leave', 'promote', 'demote'].includes(anu.action)) {
        deleteCachedMeta(anu.id);
      }

      const metadata = await (async () => {
        const cached = getCachedMeta(anu.id);
        if (cached) return cached;

        for (let i = 0; i < 3; i++) {
          const m = await sock.groupMetadata(anu.id).catch(() => null);

          if (m) {
            setCachedMeta(anu.id, m);
            return m;
          }

          await new Promise(r => setTimeout(r, 1500));
        }

        return null;
      })();

      const groupAdmins = metadata
        ? getGroupAdmins(metadata.participants)
        : [];

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      const chat = await db.getChat(anu.id);
      const botSettings = await db.getSettings(botId);

      const primaryBotId = chat?.primaryBot;
      const isSelf = (botSettings?.self ?? 0) || (chat?.isMute ?? false);

      if (isSelf) return;

      const tiempo = moment
        .tz('America/Bogota')
        .format('DD/MM/YYYY');

      const tiempo2 = moment
        .tz('America/Bogota')
        .format('hh:mm A');

      const memberCount = metadata?.participants?.length || 0;

      for (const p of anu.participants) {
        const jid = resolveEventParticipant(p, sock);

        if (!jid) continue;

        const phone = jid.split('@')[0];

        const userData = await db.getUser(jid);
        const name = userData?.name || phone;

        const userAvatar = await sock
          .profilePictureUrl(jid, 'image')
          .catch(() => null);

        if (
          anu.action === 'add' &&
          chat?.welcome &&
          chat?.welcomeMessage &&
          (!primaryBotId || primaryBotId === botId)
        ) {
          if (!metadata) continue;

          let imageUrl = await sock
            .profilePictureUrl(anu.id, 'image')
            .catch(() => null);

          if (!imageUrl) {
            imageUrl = userAvatar;
          }

          let customMessage = chat.welcomeMessage
            .replace(/@user/gi, `@${phone}`)
            .replace(/@group/gi, metadata.subject || 'Nuestro grupo')
            .replace(/@desc/gi, metadata.desc || 'Sin descripción')
            .replace(/@members/gi, String(memberCount))
            .replace(/@time/gi, `${tiempo} ${tiempo2}`);

          customMessage = customMessage.trim();

          const caption = `
╭━━━〔 ✦ BIENVENIDO ✦ 〕━╮
│
│  ✐ Hola, @${phone}
│
│  Bienvenido a:
│  *${metadata.subject || 'Nuestro grupo'}*
│
│  "${customMessage}"
│
├────────────
│  Usuario: ${phone}
│  Miembros: *${memberCount}*
│  Fecha: *${tiempo}*
│  Hora: *${tiempo2}*
│
│  ✦ Esperamos que disfrutes
│    tu estancia con nosotros.
│
╰━━━━━━━━━━━━╯
          `.trim();

          if (imageUrl) {
            await sock.sendMessage(anu.id, {
              image: {
                url: imageUrl
              },
              caption,
              mentions: [jid]
            });
          } else {
            await sock.sendMessage(anu.id, {
              text: caption,
              mentions: [jid]
            });
          }
        }

        if (
          (anu.action === 'remove' || anu.action === 'leave') &&
          chat?.goodbye &&
          (!primaryBotId || primaryBotId === botId)
        ) {
          if (!metadata) continue;

          const caption = `
卐卐卐 〔 AIZEN BOT 〕 卐卐卐

⧖ Kyōka Suigetsu ⧖
\`═══════════════\`

✐ El usuario @${phone} ha salido de \`${metadata.subject || ''}\`

\`═══════════════\`

"Todo ocurre según mi voluntad…"

Ahora somos *${memberCount}* miembros.
Usa /help para ver los comandos.
          `.trim();

          await sock.sendMessage(anu.id, {
            text: caption,
            mentions: [jid]
          });
        }

        if (anu.action === 'remove' || anu.action === 'leave') {
          const user = chat?.users?.[jid];

          if (
            user &&
            typeof user.afk === 'number' &&
            user.afk > -1
          ) {
            if (chat && chat.users && chat.users[jid]) {
              chat.users[jid].afk = -1;
              chat.users[jid].afkReason = '';
            }
          }
        }

        if (
          anu.action === 'promote' &&
          chat?.alerts &&
          (!primaryBotId || primaryBotId === botId)
        ) {
          const authorJid =
            normalizeJid(anu.author) || anu.author;

          await sock.sendMessage(anu.id, {
            text: `卐卐卐 〔 AIZEN BOT 〕 卐卐卐

⧖ Kyōka Suigetsu ⧖
\`═══════════════\`

✐ *@${phone}* ha sido promovido a Administrador por *@${authorJid.split('@')[0]}*

\`═══════════════\`

"La traición es el verdadero poder…"`,
            mentions: [
              jid,
              authorJid,
              ...groupAdmins
            ]
          });
        }

        if (
          anu.action === 'demote' &&
          chat?.alerts &&
          (!primaryBotId || primaryBotId === botId)
        ) {
          const authorJid =
            normalizeJid(anu.author) || anu.author;

          await sock.sendMessage(anu.id, {
            text: `卐卐卐 〔 AIZEN BOT 〕 卐卐卐

⧖ Kyōka Suigetsu ⧖
\`═══════════════\`

✐ *@${phone}* ha sido degradado de Administrador por *@${authorJid.split('@')[0]}*

\`═══════════════\`

"Todo ocurre según mi voluntad…"`,
            mentions: [
              jid,
              authorJid,
              ...groupAdmins
            ]
          });
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT ERROR ] → ${err}`));
    }
  });
};
