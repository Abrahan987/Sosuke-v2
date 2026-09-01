
import db from "#db"

export default {
  command: ['setwelcome'],
  category: 'grupo',
  isAdmin: true,

  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat;
    const chat = await db.getChat(chatId);

    if (!args.length) {
      return msg.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ Set Welcome ࣭𑁯ᰍ   ̊ ܃܃

*❒ Variables disponibles:*

𖣣ֶㅤ֯⌗ ✤ ⬭ @user
> → Mención del usuario que entra

𖣣ֶㅤ֯⌗ ✤ ⬭ @group
> → Nombre del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @desc
> → Descripción del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @members
> → Número de miembros actuales

𖣣ֶㅤ֯⌗ ✤ ⬭ @time
> → Fecha y hora

✿ Si ya tienes un mensaje configurado y quieres borrarlo:
${prefix + command} 0`);
    }

    if (args[0] === '0') {
      if (!chat?.welcomeMessage || chat.welcomeMessage.trim() === '') {
        return msg.reply('✎ No tienes ningún mensaje de bienvenida definido.');
      }

      await db.updateChat(chatId, 'welcomeMessage', '');
      await db.updateChat(chatId, 'welcome', false);

      return msg.reply('✐ Mensaje de bienvenida eliminado.');
    }

    if (chat?.welcomeMessage && chat.welcomeMessage.trim() !== '') {
      return msg.reply(`《✤》 Ya tienes un mensaje de bienvenida configurado:

${chat.welcomeMessage}

Si quieres reemplazarlo, primero bórralo con:
${prefix + command} 0`);
    }

    const texto = args.join(' ').trim();

    if (!texto) {
      return msg.reply('✎ Debes escribir un mensaje de bienvenida.');
    }

    await db.updateChat(chatId, 'welcomeMessage', texto);
    await db.updateChat(chatId, 'welcome', true);

    return msg.reply(`✐ Nuevo mensaje de bienvenida configurado correctamente.

✦ La bienvenida ha sido activada automáticamente.`);
  }
};
