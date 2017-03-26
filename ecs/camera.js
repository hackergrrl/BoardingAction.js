var Physics = require('./physics')

function Camera () {
}

Camera.install = function (recs, app) {
  recs.system('sync camera<->stage', [Physics, Camera], function (e) {
    app.stage.x = -e.physics.x
    app.stage.y = -e.physics.y
  })
}

module.exports = Camera
