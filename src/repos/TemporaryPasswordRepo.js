const RDS = require('../serverlogic/RDS')

class TemporaryPasswordRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'temporary_password',
      schema: 'authentication',
      columns: ['id', 'password', 'created'],
      primaryIDColumn: ['id'],
      pgClient: options.pgClient
    })
  }

  async insertNewUserIdAndPassword (user_id, newRandomPassword, createdTimestamp) {
    return this._insert({id: user_id.toLowerCase(), password: newRandomPassword}).then(resp => {
      resp.user_id = resp.id
      return resp
    })
  }

  async selectTemporaryPasswordById (user_id) {
    return await this._selectOnePid(user_id.toLowerCase())
  }

  async deleteAllOldTempPasswords () {
    let sql = `DELETE from ${this.t} where 
      created + (${this.TIME_LIMIT} * interval '1 milliseconds') < CURRENT_TIMESTAMP`
    await this._execute(sql)
  }

  async deleteTempPassword (user_id) {
    return await this._delete(user_id.toLowerCase())
  }
}

module.exports = {TemporaryPasswordRepo}
