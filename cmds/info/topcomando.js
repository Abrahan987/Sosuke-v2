import db from '#db'

export default {
  command: ['topcomando', 'top10', 'topcmd'],
  category: 'info',
  run: async ({ msg, sock }) => {
    try {
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const settings = await db.getSettings(botId)
      const stats = settings.commandStats || {}
      const ranking = Object.entries(stats)
        .filter(([, count]) => Number(count) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 10)

      if (!ranking.length) {
        return msg.reply('✦ Todavía no hay estadísticas de comandos. Cuando ejecutes comandos aparecerán aquí.')
      }

      const message = [
        '╭─《 TOP 10 COMANDOS 》─╮',
        ...ranking.map(([command, count], index) => `│ ${index + 1}. *${command}* — *${Number(count).toLocaleString()}*`),
        '╰─══════════════════─╯'
      ].join('\n')

      await msg.reply(message)
    } catch (error) {
      console.error('[TOPCOMANDO ERROR]', error)
      await msg.reply(global.msgglobal)
    }
  }
}
