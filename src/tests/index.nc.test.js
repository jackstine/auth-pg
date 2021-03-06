const authPostgres = require("../");
const pg = require("pg");
const config = require("../config");
const { CONNECTION } = require("../serverlogic/RDS");
let chai = require("chai");
let expect = chai.expect;
chai.should();

let userInfo = {
  first_name: "jacob",
  last_name: "cukjati",
  username: "jacobCukjati@gmail.com",
  email: "jacobCukjati@gmail.com",
  phone: "8503616563",
  password: "password",
};
let newPassword = "newpassword";
let userInfoClone = { ...userInfo };
let vc = "3e5764ed-fa5a-4e40-be4e-fbe228d009d2";

let users = null;
let token = null;

describe("#index", function () {
  describe("#create", function () {
    it("should build", function (done) {
      authPostgres
        .create({ pgClient: new pg.Client(config.DBs.authenticationServer) })
        .then(async (resp) => {
          users = resp.auth.users;
          token = resp.auth.token;
          await CONNECTION.__setup();
          done();
        })
        .catch(console.error);
    });
  });
  describe("#users", function () {
    beforeEach(function (done) {
      if (!users && !token) {
        authPostgres
          .create({ pgClient: new pg.Client(config.DBs.authenticationServer) })
          .then(async (resp) => {
            users = resp.auth.users;
            token = resp.auth.token;
            await CONNECTION.__setup();
            await authPostgres.__reset();
            done();
          })
          .catch(console.error);
      } else {
        userInfo = { ...userInfoClone };
        authPostgres.__reset().then((resp) => {
          done();
        });
      }
    });
    describe("#createUserVerificationAndPassword", function () {
      it("should create users and verification and password", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then((userAndVerification) => {
            let { user, verification, password, token } = userAndVerification;
            expect(user.email).to.be.equal(userInfo.email.toLowerCase());
            expect(user.verified).to.be.equal(false);
            expect(verification.email).to.be.equal(userInfo.email.toLowerCase());
            expect(verification.verification_code).to.be.a("string");
            expect(password).to.be.undefined;
            expect(token.token).to.be.a("string");
            expect(token.expires).to.be.a("number");
            done();
          })
          .catch(console.error);
      });
    });
    describe("#verifyUser", function () {
      it("#verifyUser", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then((userAndVerification) => {
            let { verification } = userAndVerification;
            users
              .verifyUser(verification.verification_code)
              .then((user) => {
                expect(user.verified).to.be.equal(true);
                expect(user.email).to.be.equal(userInfo.email.toLowerCase());
                done();
              })
              .catch(console.error);
          })
          .catch(console.error);
      });
    });
    describe("#forgotPassword", function (done) {
      it("should return password when forgotten", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then((userAndVerification) => {
            users
              .forgotPassword(userInfo.email)
              .then((userInfoTempPassword) => {
                let { email, password, expiresIn } = userInfoTempPassword;
                expect(email).to.be.equal(userInfo.email.toLowerCase());
                expect(password).to.be.a("string");
                expect(expiresIn).to.be.a("number");
                done();
              })
              .catch(console.error);
          })
          .catch(console.error);
      });
    });
    describe("#resetPasswordFromTemporaryPassword", function (done) {
      it("should reset the password from the temporary password", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then((userAndVerification) => {
            users
              .forgotPassword(userInfo.email)
              .then((userInfoTempPassword) => {
                users
                  .resetPasswordFromTemporaryPassword(
                    userInfo.email,
                    userInfoTempPassword.password,
                    newPassword
                  )
                  .then((resp) => {
                    expect(resp).to.be.equal(true);
                    done();
                  })
                  .catch(console.error);
              })
              .catch(console.error);
          })
          .catch(console.error);
      });
    });
    describe("#getUser", function () {
      it("should retrieve the user", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then(async (userAndVerification) => {
            let { user, verification, password } = userAndVerification;
            user = await users.getUser(user.email);
            expect(user.id).to.be.a("string");
            expect(user.first_name).to.be.equal(userInfo.first_name);
            expect(user.last_name).to.be.equal(userInfo.last_name);
            expect(user.username).to.be.equal(userInfo.username);
            expect(user.email).to.be.equal(userInfo.email);
            expect(user.last_name).to.be.equal(userInfo.last_name);
            expect(user.email).to.be.equal(userInfo.email);
            expect(user.phone).to.be.equal(userInfo.phone);
            expect(user.verified).to.be.equal(false);
            expect(user.created_date).to.be.a("date");
            done();
          })
          .catch(console.error);
      });
      it("should return null for user that does not exist", function (done) {
        users.getUser("garjack").then((user) => {
          expect(user).to.be.null;
          done();
        });
      });
    });
    describe("#updateUser", function () {
      it("should update the user", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then(async (userAndVerification) => {
            let { user, verification, password, token } = userAndVerification;
            let resp = await users.updateUser(
              { email: user.email, first_name: "mike" },
              token.token
            );
            expect(resp.success).to.be.equal(true);
            expect(resp.user.email).to.be.equal(user.email);
            expect(resp.user.first_name).to.be.equal("mike");
            let updatedUser = await users.getUser(user.email);
            expect(updatedUser.first_name).to.be.equal("mike");
            done();
          })
          .catch(console.error);
      });
      it("should no update the user if the user does not exist", function (done) {
        users
          .updateUser({ email: "mike", first_name: "mike" }, null)
          .then(async (updateResp) => {
            expect(updateResp.success).to.be.equal(false);
            updateResp = await users.updateUser(null);
            expect(updateResp.success).to.be.equal(false);
            done();
          })
          .catch(console.error);
      });
    });
  });
  describe("#token", function () {
    beforeEach(function (done) {
      if (!users && !token) {
        authPostgres
          .create({ pgClient: new pg.Client(config.DBs.authenticationServer) })
          .then(async (resp) => {
            users = resp.auth.users;
            token = resp.auth.token;
            await CONNECTION.__setup();
            await authPostgres.__reset();
            done();
          })
          .catch(console.error);
      } else {
        userInfo = { ...userInfoClone };
        authPostgres.__reset().then((resp) => {
          done();
        });
      }
    });
    describe("#generateToken", function () {
      it("should generate a token", function (done) {
        users.createUserVerificationAndPassword(userInfo).then((userAndVerification) => {
          token
            .generateToken(userInfo.email)
            .then((generatedAuthToken) => {
              expect(generatedAuthToken.token).to.be.an("string");
              expect(generatedAuthToken.expires).to.be.an("number");
              done();
            })
            .catch(console.error);
        });
      });
    });
    describe("#authenticateToken", function () {
      it("should authentication a real token, and dis auth a bad token", function (done) {
        users.createUserVerificationAndPassword(userInfo).then((userAndVerification) => {
          token
            .generateToken(userInfo)
            .then(async (generatedAuthToken) => {
              expect(generatedAuthToken.token).to.be.an("string");
              expect(generatedAuthToken.expires).to.be.an("number");
              let auth = await token.authenticateToken(generatedAuthToken.token);
              auth.success.should.be.equal(true);
              auth.data.email.should.be.equal(userInfo.email);
              auth = await token.authenticateToken(
                "eyJhbGciOiJIUzI1NiJ9.bmFtZUByYWVtaXN0ZW1haWwuY29t.d5qu_8bzMwhWygglDWKbY9n4daCYbnbR4w-enghUI5c"
              );
              expect(auth).to.be.equal(false);
              done();
            })
            .catch(console.error);
        });
      });
    });
    describe("#login", function () {
      it("should log in the user given a real password", function (done) {
        userInfo = { ...userInfoClone };
        let password = userInfo.password;
        users
          .createUserVerificationAndPassword(userInfo)
          .then(async (userVerification) => {
            let loginResponse = await token.login(userInfoClone.email, password);
            let lu = loginResponse.user;
            expect(loginResponse.success).to.be.equal(true);
            expect(loginResponse.token.token).to.be.a("string");
            expect(loginResponse.token.expires).to.be.a("number");
            userInfo.id = lu.id;
            userInfo.created_date = lu.created_date;
            expect(lu).to.deep.equal({ ...userInfo, verified: false });
            done();
          })
          .catch(console.error);
      }); //END OF IT
      it("should  be able to login with a temporary pasword", function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let userInfoTempPassword = await users.forgotPassword(userInfo.email);
          let tempPasswordSuccess = await token.login(
            userInfo.email,
            userInfoTempPassword.password
          );
          expect(tempPasswordSuccess.verifiedWithTemporary).to.be.equal(true);
          expect(tempPasswordSuccess.success).to.be.equal(true);
          done();
        });
      }); //END OF IT
      it("should not be able to login with a fake temp password", function (done) {
        users
          .createUserVerificationAndPassword(userInfo)
          .then(async (userVerification) => {
            let tempPasswordSuccess = await token.login(userInfo.email, "dummyPass");
            expect(tempPasswordSuccess.success).to.be.equal(false);
            tempPasswordSuccess = await token.login(userInfo.email, null);
            expect(tempPasswordSuccess.success).to.be.equal(false);
            tempPasswordSuccess = await token.login(null, null);
            expect(tempPasswordSuccess.success).to.be.equal(false);
            tempPasswordSuccess = await token.login(null, "fakepassword");
            expect(tempPasswordSuccess.success).to.be.equal(false);
            done();
          })
          .catch(console.error);
      }); //END OF IT
      it("should not be able to login with a temporary pasword of another user", function (done) {
        users.createUserVerificationAndPassword(userInfo).then(async (userVerification) => {
          let userInfoTempPassword = await users.forgotPassword(userInfo.email);
          let tempPasswordSuccess = await token.login(
            "differentUser",
            userInfoTempPassword.password
          );
          expect(tempPasswordSuccess.success).to.be.equal(false);
          done();
        });
      }); //END OF IT
    });
    describe("#googleSignIn", function () {
      it("should have the function", function (done) {
        // console.log(token.google)
        // console.log(token.googleSignin)
        expect(token.googleSignin).to.be.a("function");
        done();
      });
    });
  });
});
