const {TemporaryPasswordRepo} = require('./repos/TemporaryPasswordRepo')
const {TokenRepo} = require('./repos/TokenRepo')
const {UserRepo} = require('./repos/UserRepo')
const {UserVerificationRepo} = require('./repos/UserVerificationRepo')
const {PasswordRepo} = require('./repos/PasswordRepo')
const {auth, createAuthentication} = require('@nodeauth/authentication')

let __config = null
let __auth = {}

module.exports = {
  auth: __auth,
  async create(options) {
    let config = {
      plugin: {
        TemporaryPasswordRepo: new TemporaryPasswordRepo(options),
        TokenRepo: new TokenRepo(options),
        UserRepo: new UserRepo(options),
        UserVerificationRepo: new UserVerificationRepo(options),
        PasswordRepo: new PasswordRepo(options)
      }
    }
    await createAuthentication({...config, ...options})
    __config = config
    for (let key of Object.keys(auth)) {
      __auth[key] = auth[key]
    }
    return {config, auth}
  },
  __reset () {
    if (__config) {
      return Promise.all([
        __config.plugin.TemporaryPasswordRepo._warningThisWillDeleteEverything(),
        __config.plugin.TokenRepo._warningThisWillDeleteEverything(),
        __config.plugin.UserRepo._warningThisWillDeleteEverything(),
        __config.plugin.UserVerificationRepo._warningThisWillDeleteEverything(),
        __config.plugin.PasswordRepo._warningThisWillDeleteEverything()
      ])
    }
  }
}