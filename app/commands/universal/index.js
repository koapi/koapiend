const { addonArgs } = require('../../lib/helper')
const shelljs = require('shelljs')

exports.default = {
  command: 'universal',
  describe: 'run universal server',
  builder: {
    build: {
      alias: 'b',
      describe: 'build before start',
      boolean: true
    }
  },
  handler: argv => {
    if (argv.build) shelljs.exec(`npm start build -- ${addonArgs()}`)
    require('./server').default()
  }
}