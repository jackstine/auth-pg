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

  async insertNewUserIdAndPassword (userid, newRandomPassword, createdTimestamp) {
    return this._insert({id: userid.toLowerCase(), password: newRandomPassword}).then(resp => {
      resp.userId = resp.id
      delete resp.id
      return resp
    })
  }

  async selectTemporaryPasswordById (userid) {
    return await this._selectOnePid(userid.toLowerCase())
  }

  async deleteAllOldTempPasswords () {
    let sql = `DELETE from ${this.t} where 
      created + (${this.TIME_LIMIT} * interval '1 milliseconds') < CURRENT_TIMESTAMP`
    await this._execute(sql)
  }

  async deleteTempPassword (userid) {
    return await this._delete(userid.toLowerCase())
  }
}

module.exports = {TemporaryPasswordRepo}
