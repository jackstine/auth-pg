const authPostgres = require('../')
const pg = require('pg')
const config = require('../config')
const {CONNECTION} = require('../serverlogic/RDS')
let chai = require('chai')
let expect = chai.expect
chai.should()

let userInfo = {
  first_name: 'jacob',
  last_name: 'cukjati',
  username: 'jacobCukjati@gmail.com',
  email: 'jacobCukjati@gmail.com',
  user_id: 'jacobCukjati@gmail.com',
  phone: '8503616563',
  password: 'password'
}
let newPassword = 'newpassword'
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
            users.resetPasswordFromTemporaryPassword(userInfo.user_id, userInfoTempPassword.password, newPassword).then(resp => {
              expect(resp).to.be.equal(true)
              done()
            }).catch(console.error)
          }).catch(console.error)
        }).catch(console.error)
      })
    })
    describe('#getUser', function () {
      it('should retrieve the user', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async userAndVerification => {
          let {user, verification, password} = userAndVerification
          user = await users.getUser(user.user_id)
          expect(user.id).to.be.a('string')
          expect(user.first_name).to.be.equal(userInfo.first_name)
          expect(user.last_name).to.be.equal(userInfo.last_name)
          expect(user.username).to.be.equal(userInfo.username)
          expect(user.user_id).to.be.equal(userInfo.user_id)
          expect(user.last_name).to.be.equal(userInfo.last_name)
          expect(user.email).to.be.equal(userInfo.email)
          expect(user.phone).to.be.equal(userInfo.phone)
          expect(user.verified).to.be.equal(false)
          expect(user.created_date).to.be.a('date')
          done()
        }).catch(console.error)
      })
      it('should return null for user that does not exist', function (done) {
        users.getUser('garjack').then(user => {
          expect(user).to.be.null
          done()
        })
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
      it('should generate a token', function (done) {
        token.generateToken(userInfo.user_id).then(generatedAuthToken => {
          expect(generatedAuthToken).to.be.an('string')
          done()
        }).catch(console.error)
      })
    })
    describe('#authenticateToken', function () {
      it('should authentication a real token, and dis auth a bad token', function (done) {
        token.generateToken(userInfo).then(async generatedAuthToken => {
          expect(generatedAuthToken).to.be.an('string')
          let auth = await token.authenticateToken(generatedAuthToken)
          auth.should.be.equal(true)
          auth = await token.authenticateToken('eyJhbGciOiJIUzI1NiJ9.bmFtZUByYWVtaXN0ZW1haWwuY29t.d5qu_8bzMwhWygglDWKbY9n4daCYbnbR4w-enghUI5c')
          expect(auth).to.be.equal(false)
          done()
        }).catch(console.error)
      })
    })
    describe('#login', function () {
      it('should log in the user given a real password', function (done) {
        let password = userInfo.password
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let loginResponse = await token.login(userInfo.user_id, password)
          expect(loginResponse.success).to.be.equal(true)
          expect(loginResponse.token).to.be.a('string')
          done()
        })
      })//END OF IT
      it('should  be able to login with a temporary pasword', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let userInfoTempPassword = await users.forgotPassword(userInfo.user_id)
          let tempPasswordSuccess = await token.login(userInfo.user_id, userInfoTempPassword.password)
          expect(tempPasswordSuccess.verifiedWithTemporary).to.be.equal(true)
          expect(tempPasswordSuccess.success).to.be.equal(true)
          done()
        })
      })//END OF IT
      it('should not be able to login with a fake temp password', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let tempPasswordSuccess = await token.login(userInfo.user_id, 'dummyPass')
          expect(tempPasswordSuccess.success).to.be.equal(false)
          tempPasswordSuccess = await token.login(userInfo.user_id, null)
          expect(tempPasswordSuccess.success).to.be.equal(false)
          tempPasswordSuccess = await token.login(null, null)
          expect(tempPasswordSuccess.success).to.be.equal(false)
          tempPasswordSuccess = await token.login(null, 'fakepassword')
          expect(tempPasswordSuccess.success).to.be.equal(false)
          done()
        }).catch(console.error)
      })//END OF IT
      it('should not be able to login with a temporary pasword of another user', function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let userInfoTempPassword = await users.forgotPassword(userInfo.user_id)
          let tempPasswordSuccess = await token.login('differentUser', userInfoTempPassword.password)
          expect(tempPasswordSuccess.success).to.be.equal(false)
          done()
        })
      })//END OF IT
    })
  })
})