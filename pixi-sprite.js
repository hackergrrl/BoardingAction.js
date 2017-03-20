var Physics = require('./physics').Physics

function PixiSprite () {
}

module.exports.install = function (recs, app) {
  recs.system('sync physics<->pixiSprite', [Physics, PixiSprite], function (e) {
    e.pixiSprite.x = e.physics.x
    e.pixiSprite.y = e.physics.y
    e.pixiSprite.rotation = e.physics.rot
  })
}

module.exports.PixiSprite = PixiSprite

