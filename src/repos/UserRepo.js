const RDS = require("../serverlogic/RDS");
const { v4: uuid4 } = require("uuid");

class UserRepo extends RDS.RDS1 {
  constructor(options) {
    super({
      tableName: "users",
      schema: "authentication",
      columns: [
        "id",
        "first_name",
        "last_name",
        "username",
        "email",
        "phone",
        "verified",
        "created_date",
      ],
      primaryIDColumn: ["email"],
      pgClient: options.pgClient,
    });
  }

  async getUserIsVerified(email) {
    return await this._selectManyFromKey("email", email.toLowerCase(), ["verified"]).then(
      (resp) => {
        if (resp.length === 1) {
          return resp[0].verified;
        } else {
          return false;
        }
      }
    );
  }

  async updateUser(record) {
    record.email = record.email.toLowerCase();
    return await this._update(record)
      .then((resp) => {
        if (resp.rowCount > 1) {
          throw Error(`A user has updated more than 1 users, ${record.email}`);
        }
        return resp.rowCount === 1;
      })
      .catch((resp) => false);
  }

  async createUser(userInfo) {
    let record = {
      ...userInfo,
      email: userInfo.email.toLowerCase(),
      id: uuid4(),
      verified: false,
    };
    return await this._insert(record);
  }

  async verifyUser(email) {
    let record = { email: email.toLowerCase(), verified: true };
    return await this._update(record).then((resp) => {
      return record;
    });
  }

  async getUser(email) {
    return await this._selectOnePid(email.toLowerCase());
  }
}

module.exports = { UserRepo };
