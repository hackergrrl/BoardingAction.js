var Physics = require('./physics')

function PixiSprite (e) {
  var self = this
  e.on('component removed', function (Component) {
    if (Component === PixiSprite) {
      e.pixiSprite.parent.removeChild(e.pixiSprite)
    }
  })
}

PixiSprite.install = function (recs, app) {
  recs.system('sync physics<->pixiSprite', [Physics, PixiSprite], function (e) {
    e.pixiSprite.x = e.physics.x
    e.pixiSprite.y = e.physics.y
    e.pixiSprite.rotation = e.physics.rot
  })
}

module.exports = PixiSprite
