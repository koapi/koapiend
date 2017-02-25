const { bookshelf } = require('koapi/lib/model')
const Joi = require('joi')

exports.default = class OAuthCode extends bookshelf.Model {
  get tableName () {
    return 'oauth_authorization_codes'
  }
  get idAttribute () {
    return 'code'
  }
  get hasTimestamps () {
    return true
  }
  static get fields () {
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