const { model } = require('koapi')
const Joi = require('joi')

module.exports = class Code extends model.Base {
  get tableName () {
    return 'oauth_authorization_codes'
  }
  get idAttribute () {
    return 'code'
  }
  get hasTimestamps () {
    return true
  }
  static get validator () {
    return {
      code: Joi.string(),
      client_id: Joi.string(),
      user_id: Joi.string(),
      redirect_uri: Joi.string(),
      scope: Joi.string(),
      expires_at: Joi.date()
    }
  };
}
