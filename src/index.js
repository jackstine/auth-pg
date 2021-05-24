const {TemporaryPasswordRepo} = require('./repos/TemporaryPasswordRepo')
const {TokenRepo} = require('./repos/TokenRepo')
const {UserRepo} = require('./repos/UserRepo')
const {UserVerificationRepo} = require('./repos/UserVerificationRepo')
const {PasswordRepo} = require('./repos/PasswordRepo')

module.exports = {
  create(options) {
    return  {
      TemporaryPasswordRepo: new TemporaryPasswordRepo(options),
      TokenRepo: new TokenRepo(options),
      UserRepo: new UserRepo(options),
      UserVerificationRepo: new UserVerificationRepo(options),
      PasswordRepo: new PasswordRepo(options)
    }
  }
}