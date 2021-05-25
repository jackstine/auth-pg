const {CONNECTION} = require('../../serverlogic/RDS')

describe('RDS', function () {
  describe('#CONNECTION', function () {
    it('should connect', function (done) {
      CONNECTION.__setup().then(resp => {
        done()
      }).catch(console.error)
    })
  })
})
