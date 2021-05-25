const RDS = require('../serverlogic/RDS')

class UserVerificationRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'user_verification',
      schema: 'authentication',
      columns: ['user_id', 'verification_code', 'created'],
      primaryIDColumn: ['verification_code'],
      pgClient: options.pgClient
    })
  }

  async getVerificationCode (verificationCode) {
    return await this._selectOnePid(verificationCode).then(vc => {
      vc.userId = vc.user_id
      vc.verificationCode = vc.verification_code
      delete vc.verification_code
      delete vc.user_id
      return vc
    })
  }

  async createVerificationCode (userId, vc) {
    return await this._insert({user_id: userId.toLowerCase(), verification_code: vc}).then(vc => {
      vc.userId = vc.user_id
      vc.verificationCode = vc.verification_code
      delete vc.verification_code
      delete vc.user_id
      return vc
    })
  }

  async deleteVerificationCode(verificationCode) {
    return await this._delete(verificationCode)
  }
}

module.exports = {UserVerificationRepo}
