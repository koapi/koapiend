const pkg = require('../../package')
const cwd = `${__dirname}/../../`

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: `${pkg.name}_universal`,
      script: 'index.js',
      args: 'universal',
      cwd,
      env: {
        NODE_ENV: process.env.NODE_ENV
      },
      node_args: '--harmony'
    },
    // {
    //   name: `${pkg.name}_api`,
    //   script: 'npm',
    //   args: 'start server',
    //   node_args: '--harmony',
    //   env: {
    //     NODE_ENV: 'development'
    //   }
    // },
    {
      name: `${pkg.name}_service`,
      cwd,
      script: 'index.js',
      args: 'service',
      node_args: '--harmony',
      env: {
        NODE_ENV: process.env.NODE_ENV
      }
    }
  ]
}