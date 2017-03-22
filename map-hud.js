var Camera = require('./camera')
var Physics = require('./physics')

function MapHud () {
  var container = new PIXI.Container()
  app.stage.addChild(container)

  var bg = new PIXI.Graphics()
  bg.lineStyle(3, 0x444411, 1)
  bg.beginFill(0x000000)
  bg.moveTo(0, 0)
  bg.lineTo(200, 0)
  bg.lineTo(200, 200)
  bg.lineTo(0, 200)
  bg.lineTo(0, 0)
  bg.endFill()
  container.addChild(bg)

  return container
}

MapHud.install = function (recs, app) {
  recs.system('lock on-screen', [MapHud], [Camera, Physics], function (m, c) {
    m.mapHud.x = c.physics.x + app.renderer.width - 200
    m.mapHud.y = c.physics.y
  })
}

module.exports = MapHud
