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
    return await this._selectOnePid(verificationCode)
  }

  async createVerificationCode (userId, vc) {
    return await this._insert({user_id: userId.toLowerCase(), verification_code: vc})
  }

  async deleteVerificationCode(verificationCode) {
    return await this._delete(verificationCode)
  }
}

module.exports = {UserVerificationRepo}
