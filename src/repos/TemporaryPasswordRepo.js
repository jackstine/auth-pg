const RDS = require("../serverlogic/RDS");

class TemporaryPasswordRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: "temporary_password",
      schema: "authentication",
      columns: ["id", "password", "created"],
      primaryIDColumn: ["id"],
      pgClient: options.pgClient,
    });
  }

  async insertNewUserIdAndPassword(email, newRandomPassword, createdTimestamp) {
    return this._insert({ id: email.toLowerCase(), password: newRandomPassword }).then((resp) => {
      resp.email = resp.id;
      return resp;
    });
  }

  async selectTemporaryPasswordById(email) {
    return await this._selectOnePid(email.toLowerCase());
  }

  async deleteAllOldTempPasswords() {
    let sql = `DELETE from ${this.t} where 
      created + (${this.TIME_LIMIT} * interval '1 milliseconds') < CURRENT_TIMESTAMP`;
    await this._execute(sql);
  }

  async deleteTempPassword(email) {
    return await this._delete(email.toLowerCase());
  }
}

module.exports = { TemporaryPasswordRepo };
