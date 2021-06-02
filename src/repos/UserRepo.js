const RDS = require('../serverlogic/RDS')
const {v4: uuid4} = require('uuid')

class UserRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'users',
      schema: 'authentication',
      columns: ['id', 'first_name', 'last_name', 'username', 'user_id', 'email', 'phone', 'verified', 'created_date'],
      primaryIDColumn: ['user_id'],
      pgClient: options.pgClient
    })
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

  async updateUser (record) {
    record.user_id = record.user_id.toLowerCase()
    return await this._update(record).then(resp => {
      if (resp.rowCount > 1) {
        throw Error(`A user has updated more than 1 users, ${record.user_id}`)
      }
      return resp.rowCount === 1
    }).catch(resp => false)
  }

  async createUser (userInfo) {
    let record = {
      ...userInfo,
      user_id: userInfo.user_id.toLowerCase(),
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

  async getUser (user_id) {
    return await this._selectOnePid(user_id.toLowerCase())
  }
}

module.exports = {UserRepo}
