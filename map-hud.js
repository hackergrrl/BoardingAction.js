var Camera = require('./camera')
var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var Ship = require('./ship')

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

  container.blips = {}

  return container
}

MapHud.install = function (recs, app) {
  recs.system('lock on-screen', [MapHud], [Camera, Physics], function (m, c) {
    m.mapHud.x = c.physics.x + app.renderer.width - 200
    m.mapHud.y = c.physics.y
  })

  recs.system('manage blips', [MapHud], [Physics, Ship, PixiSprite], function (m, s) {
    var zoom = 0.05

    var x = (s.physics.x - player.physics.x) * zoom + 100
    var y = (s.physics.y - player.physics.y) * zoom + 100
    if (x < 0 || x > 200 || y < 0 || y > 200) {
      if (m.mapHud.blips[s.id]) {
        m.mapHud.removeChild(m.mapHud.blips[s.id])
        delete m.mapHud.blips[s.id]
      }
      return
    }

    if (!m.mapHud.blips[s.id]) {
      var blip = new PIXI.Graphics()
      blip.beginFill(s.pixiSprite.tint)
      if (s.ship.station) {
        var size = 5
        blip.drawCircle(0, 0, size)
      } else {
        var size = Math.floor(Math.max(4, s.pixiSprite.texture.baseTexture.width * 0.08))
        blip.moveTo(0, -size*0.3)
        blip.lineTo(size, 0)
        blip.lineTo(0, size*0.3)
        blip.lineTo(0, -size*0.3)
      }
      blip.endFill()
      m.mapHud.addChild(blip)
      m.mapHud.blips[s.id] = blip
    }

    m.mapHud.blips[s.id].x = x
    m.mapHud.blips[s.id].y = y
    m.mapHud.blips[s.id].rotation = s.physics.rot
  })
}

module.exports = MapHud
