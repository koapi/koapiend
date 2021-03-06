module.exports = {
  command: 'watch [servers..]',
  describe: 'watch mode',
  builder: yargs =>
    yargs.options({
      port: { alias: 'p' },
      client: { alias: 'c', type: 'boolean' },
      bundle: { alias: 'b', type: 'boolean' }
    }),
  async handler (argv) {
    const servers = (argv.servers || []).length ? argv.servers : ['app/next']
    const shelljs = require('shelljs')
    const { addonArgs } = require('../lib/helper')
    process.env.WATCH_MODE = true
    if (argv.client) {
      const args = addonArgs()
      servers.forEach(name => {
        const command = `webpack-dev-server --config ./app/clients/${name}/webpack \
        --history-api-fallback --inline \
        --host 0.0.0.0 ${args}`
        shelljs.exec(command, {
          maxBuffer: 1024 * 1000
        })
      })
    } else {
      const commands = [
        `nodemon --harmony --watch app --ignore app/clients -L -e js,es,jsx ./app/index.js -- ${servers.join(' ')}`
      ]
      const names = ['server']
      servers.forEach(name => {
        const server = require(`../servers/${name}`)
        if (server.clients) {
          server.clients.forEach(client => {
            names.push(`client:${client}`)
            commands.push(`npm start watch ${client} -- -c`)
          })
        }
      })
      shelljs.exec(
        commands.length > 1
          ? `concurrently -p name -n "${names.join(',')}" ${commands
              .map(c => `"${c}"`)
              .join(' ')}`
          : commands[0]
      )
    }
  }
}
