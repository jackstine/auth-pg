const RDS = require('../serverlogic/RDS')

class PasswordRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'passwords',
      schema: 'authentication',
      columns: ['id', 'password', 'key'],
      primaryIDColumn: ['id'],
      pgClient: options.pgClient
    })
  }

  async insertPassword({userId, password, key}) {
    return this._insert({id: userId, password, key})
  }

  async update (id, oldPassword, newPassword) {
    if (await this.checkPassword(id, oldPassword)) {
      return await this.__OverrideUpdatePasswordNeverUseOnlyDireSituations(id, newPassword)
    }
  }

  async deletePasswordById (id) {
    return this._delete(id)
  }

  async updatePasswordOnlyShouldBeUsedOnce (id, password, key) {
    return this._update({id, password, key})
  }

  async getPasswordForId (id) {
    return await this._selectOnePid(id)
  }
}

module.exports = {PasswordRepo}
