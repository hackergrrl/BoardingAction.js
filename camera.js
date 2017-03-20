var Physics = require('./physics').Physics

function Camera () {
}

module.exports.install = function (recs, app) {
  recs.system('auto-pan camera', [Physics, Camera], function (e) {
    e.physics.x += 0.2
    e.physics.y += 0.3

    app.stage.x = -e.physics.x
    app.stage.y = -e.physics.y
  })

  recs.entity('camera', [Physics, Camera], function (e) {
  })
}

module.exports.Camera = Camera
