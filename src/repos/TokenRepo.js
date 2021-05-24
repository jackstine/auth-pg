const RDS = require('../serverlogic/RDS')

class TokenRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: 'keys',
      schema: 'authentication',
      columns: ['key', 'created'],
      primaryType: RDS.PRIMARY_TYPES.NULL,
      pgClient: options.pgClient
    })
  }

  async returnAllKeysFromRepo () {
    return await this._selectAll()
  }

  async deleteTheOldestKey () {
    await this._deleteTheOldest('created')
  }

  async insertNewKey (key, created) {
    return await this._insert({key})
  }
}

module.exports = {TokenRepo}
