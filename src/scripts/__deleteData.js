const pg = require('pg')
const config = require('../config')
const authPostgres = require('../')

let client = new pg.Client(config.DBs.authenticationServer)
client.connect().then(async resp => {
  authPostgres.create({pgClient: client}).then(async resp => {
    await authPostgres.__reset()
    client.end()
  }).catch(console.error)
})


