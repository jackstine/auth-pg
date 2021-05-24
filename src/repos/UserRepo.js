const RDS = require('../serverlogic/RDS')

class UserRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'users',
      schema: 'authentication',
      // TODO need to shorten and figureout our table
      columns: ['id', 'first_name', 'last_name', 'username', 'user_id', 'email', 'phone', 'verified', 'created_date'],
      primaryIDColumn: ['user_id'],
      pgClient: options.pgClient
    })
  }

  // TODO Currently not used in the Plugin
  async getUserByUserId (userId) {
    return await this._selectOnePid(userId.toLowerCase())
  }

  async getUserIsVerified (userId) {
    return await this._selectManyFromKey('user_id', userId.toLowerCase(), ['verified']).then(resp => {
      if (resp.length === 1) {
        return resp[0].verified
      } else {
        return false
      }
    })
  }
  // TODO Currently not used in the Plugin
  async updateUser (record) {
    let newRecord = {...record}
    newRecord.user_id = newRecord.userId
    delete newRecord.userId
    return await this._update(newRecord)
  }

  async createUser (userInfo) {
    // usernames are case sensitive
    let record = {
      id: uuid4(), user_id: userInfo.userId, verified: false
    }
    return await this._insert(record).then(record => {
      record.userId = record.user_id
      delete record.user_id
      return record
    })
  }

  async verifyUser (userId) {
    return await this._update({user_id: userId.toLowerCase(), verified: true})
  }

  // TODO Currently not used in the Plugin
  async hasEmail (email) {
    return await this._selectManyFromKey('email', email.toLowerCase()).then(resp => {
      return resp.length > 0
    })
  }
}

module.exports = {UserRepo}
