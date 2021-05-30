const authPostgres = require('../')
const pg = require('pg')
const config = require('../config')
const {CONNECTION} = require('../serverlogic/RDS')
let chai = require('chai')
let expect = chai.expect
chai.should()

let userInfo = {
  firstName: 'jacob',
  lastName: 'cukjati',
  username: 'jacobCukjati@gmail.com',
  email: 'jacobCukjati@gmail.com',
  user_id: 'jacobCukjati@gmail.com',
  phone: '8503616563',
  password: 'password',
  newPassword: 'newpassword'
}
let userInfoClone = {...userInfo}
let vc = '3e5764ed-fa5a-4e40-be4e-fbe228d009d2'

let users = null
let token = null

describe("#index", function () {
  describe('#create', function () {
    it('should build', function (done) {
      authPostgres.create({pgClient: new pg.Client(config.DBs.authenticationServer)}).then(async resp => {
        users = resp.auth.users
        token = resp.auth.token
        await CONNECTION.__setup()
        done()
      }).catch(console.error)
    })
  })
  describe('#users', function () {
    beforeEach(function (done) {
      if (!users && !token) {
        authPostgres.create({pgClient: new pg.Client(config.DBs.authenticationServer)}).then(async resp => {
          users = resp.auth.users
          token = resp.auth.token
          await CONNECTION.__setup()
          await authPostgres.__reset()
          done()
        }).catch(console.error)
      } else {
        userInfo = {...userInfoClone}
        authPostgres.__reset().then(resp => {
          done()
        })
      }
    })
    describe('#createUserVerificationAndPassword', function () {
      it('should create users and verification and password', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(userAndVerification => {
          let {user, verification, password} = userAndVerification
          expect(user.user_id).to.be.equal(userInfo.user_id.toLowerCase())
          expect(user.verified).to.be.equal(false)
          expect(verification.user_id).to.be.equal(userInfo.user_id.toLowerCase())
          expect(verification.verification_code).to.be.a('string')
          expect(password).to.be.undefined
          done()
        }).catch(console.error)
      })
    })
    describe('#verifyUser',function () {
      it('#verifyUser', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(userAndVerification => {
          let {verification} = userAndVerification
          users.verifyUser(verification.verification_code).then(user => {
            expect(user.verified).to.be.equal(true)
            expect(user.user_id).to.be.equal(userInfo.user_id.toLowerCase())
            done()
          }).catch(console.error)
        }).catch(console.error)
      })
    })
    describe('#forgotPassword', function (done) {
      it('should return password when forgotten', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(userAndVerification => {
          users.forgotPassword(userInfo.user_id).then(userInfoTempPassword => {
            let {user_id, password, expiresIn} = userInfoTempPassword
            expect(user_id).to.be.equal(userInfo.user_id.toLowerCase())
            expect(password).to.be.a('string')
            expect(expiresIn).to.be.a('number')
            done()
          }).catch(console.error)
        }).catch(console.error)
      })
    })
    describe('#resetPasswordFromTemporaryPassword', function (done) {
      it('should do something special', function (done) {
        // JAKE TODO this needs the authentication package to be pushed
        users.createUserVerificationAndPassword(userInfo).then(userAndVerification => {
          users.forgotPassword(userInfo.user_id).then(userInfoTempPassword => {
            users.resetPasswordFromTemporaryPassword(userInfo.user_id, userInfoTempPassword.password, userInfo.newPassword).then(resp => {
              expect(resp).to.be.equal(true)
              done()
            }).catch(console.error)
          }).catch(console.error)
        }).catch(console.error)
      })
      })
  })
  describe('#token', function () {
    beforeEach(function (done) {
      if (!users && !token) {
        authPostgres.create({pgClient: new pg.Client(config.DBs.authenticationServer)}).then(async resp => {
          users = resp.auth.users
          token = resp.auth.token
          await CONNECTION.__setup()
          await authPostgres.__reset()
          done()
        }).catch(console.error)
      } else {
        userInfo = {...userInfoClone}
        authPostgres.__reset().then(resp => {
          done()
        })
      }
    })
    describe('#generateToken', function () {
      it('it should generate a token', function (done) {
        token.generateToken(userInfo.user_id).then(generatedAuthToken => {
          expect(generatedAuthToken).to.be.an('string')
          done()
        }).catch(console.error)
      })
    })
    describe('#authenticateToken', function () {
      it('it should authentication a real token, and dis auth a bad token', function (done) {
        token.generateToken(userInfo).then(async generatedAuthToken => {
          expect(generatedAuthToken).to.be.an('string')
          let auth = await token.authenticateToken(generatedAuthToken)
          auth.should.be.equal(true)
          await token.authenticateToken('eyJhbGciOiJIUzI1NiJ9.bmFtZUByYWVtaXN0ZW1haWwuY29t.d5qu_8bzMwhWygglDWKbY9n4daCYbnbR4w-enghUI5c').catch(resp => {
            // this means it threw an error
            done()
          })
        }).catch(console.error)
      })
    })
    describe('#login', function () {
      it('it should log in the user given a real password', function (done) {
        let password = userInfo.password
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let loginResponse = await token.login(userInfo.user_id, password)
          expect(loginResponse.success).to.be.equal(true)
          expect(loginResponse.token).to.be.a('string')
          done()
        })
      })//END OF IT
      it('it should  be able to login with a temporary pasword', function (done) {
        let password = userInfo.password
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let userInfoTempPassword = await users.forgotPassword(userInfo.user_id)
          let tempPasswordSuccess = await token.login(userInfo.user_id, userInfoTempPassword.password)
          console.log(tempPasswordSuccess)
          expect(tempPasswordSuccess.verifiedWithTemporary).to.be.equal(true)
          expect(tempPasswordSuccess.success).to.be.equal(true)
          done()
        })
      })//END OF IT
    })
  })
})