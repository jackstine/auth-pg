const RDS = require('../serverlogic/RDS')
const {v4: uuid4} = require('uuid')

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
  async getUserByUserId (user_id) {
    return await this._selectOnePid(user_id.toLowerCase())
  }

  async getUserIsVerified (user_id) {
    return await this._selectManyFromKey('user_id', user_id.toLowerCase(), ['verified']).then(resp => {
      if (resp.length === 1) {
        return resp[0].verified
      } else {
        return false
      }
    })
  }
  // TODO Currently not used in the Plugin
  async updateUser (record) {
    return await this._update(record)
  }

  async createUser (userInfo) {
    // usernames are case sensitive
    let record = {
      ...userInfo,
      id: uuid4(), verified: false
    }
    return await this._insert(record)
  }

  async verifyUser (user_id) {
    let record = {user_id: user_id.toLowerCase(), verified: true}
    return await this._update(record).then(resp => {
      return record
    })
  }

  // TODO Currently not used in the Plugin
  async hasEmail (email) {
    return await this._selectManyFromKey('email', email.toLowerCase()).then(resp => {
      return resp.length > 0
    })
  }

  async getUser (user_id) {
    return await this._selectOnePid(user_id)
  }
}

module.exports = {UserRepo}
