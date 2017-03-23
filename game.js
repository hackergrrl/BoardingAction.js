var recs = require('recs')()
var PIXI = require('pixi.js')
var kb = require('kb-controls')
var mousePos = require('mouse-position')

var Camera = require('./camera')
var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var Starfield = require('./starfield')
var GalaxyBoundary = require('./galaxy-boundary')
var MapHud = require('./map-hud')
var Ship = require('./ship')

// --- app setup ---
document.body.style.margin = '0px'
document.body.style.overflow = 'hidden'
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {
  backgroundColor : 0x101644
})
document.body.appendChild(app.view)
global.app = app

global.player = null

// -- controls setup ---
var ctl = kb({
  'W': 'forward',
  'A': 'left',
  'S': 'backward',
  'D': 'right'
  // '<left>': 'strafe_left'
// , '<mouse 1>': 'fire'
})
var mouse = mousePos(app.view)

// --- helper functions ---
function makeSprite (imagePath) {
  var sprite = PIXI.Sprite.fromImage(imagePath)
  sprite.anchor.set(0.5)
  app.stage.addChild(sprite)
  return sprite
}

// --- components ---

function ShipController () {
}

function CameraFollow () {
  this.target = null
}

// --- systems ---

PixiSprite.install(recs)
GalaxyBoundary.install(recs)

recs.system('camera follow', [Camera, Physics, CameraFollow], function (e) {
  if (e.cameraFollow.target) {
    e.physics.x = e.cameraFollow.target.physics.x - app.renderer.width/2
    e.physics.y = e.cameraFollow.target.physics.y - app.renderer.height/2
  }
})

Camera.install(recs, app)

Starfield.install(recs, app)
MapHud.install(recs, app)

recs.system('ship player controls', [Physics, ShipController], function (e) {
  var speed = 0.03

  if (ctl.forward) {
    e.physics.yv -= speed
  }
  if (ctl.backward) {
    e.physics.yv += speed
  }
  if (ctl.right) {
    e.physics.xv += speed
  }
  if (ctl.left) {
    e.physics.xv -= speed
  }

  var dx = mouse[0] - app.renderer.width/2
  var dy = mouse[1] - app.renderer.height/2
  e.physics.rot = Math.atan2(dy, dx)
})

Physics.install(recs)

// --- entities ---

recs.entity('star bg', [Starfield], function (e) {})

recs.entity('player ship', [Physics, PixiSprite, Ship, ShipController], function (e) {
  e.physics.x = 300
  e.physics.y = 150
  e.physics.xv = 0.5
  e.physics.yv = 0

  e.pixiSprite = makeSprite('assets/sprites/_fighter.png')

  player = e
})

for (var i = 0; i < 6; i++) {
spawnFormation(
  Math.random()*640*4,
  Math.random()*480*4,
  Math.random()*Math.PI*2,
  rand(0, 1) * 2 + 1,
  Math.random() * 64,
  Math.random() < 0.5 ? 'federation' : 'neutral')
}

function FighterPrefab (faction, cb) {
  recs.entity('fighter ship', [Physics, PixiSprite, Ship], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_fighter.png')
    e.pixiSprite.tint = faction
    cb(e)
  })
}

function GunshipPrefab (faction, cb) {
  recs.entity('gunship', [Physics, PixiSprite, Ship], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_gunship.png')
    e.pixiSprite.tint = faction
    cb(e)
  })
}

function CargoshipPrefab (faction, cb) {
  recs.entity('cargo ship', [Physics, PixiSprite, Ship], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_cargoship.png')
    e.pixiSprite.tint = faction
    cb(e)
  })
}

function spawnFormation (x, y, rot, num, padding, faction) {
  var prefabs = {
    'fighter': FighterPrefab,
    'gunship': GunshipPrefab,
    'cargo': CargoshipPrefab
  }

  if (faction === 'federation') {
    num = Math.max(num, 3)
  }

  var major = Math.min(num, Math.random() < 0.75 ? 1 : 3)
  var minor = num - major

  var tint = (faction === 'neutral' ? 0xffff4e : 0xd91c1c)

  var ships = []
  var radii = []

  for (var i = 0; i < major; i++) {
    if (Math.random() < 0.5) {
      GunshipPrefab(tint, function (e) {
        radii.push(e.pixiSprite.texture.baseTexture.width * 0.4)
        ships.push(e)
      })
    } else {
      CargoshipPrefab(tint, function (e) {
        radii.push(e.pixiSprite.texture.baseTexture.width * 0.4)
        ships.push(e)
      })
    }
  }
  for (var i = 0; i < minor; i++) {
    FighterPrefab(tint, function (e) {
      radii.push(e.pixiSprite.texture.baseTexture.width * 0.25)
      ships.push(e)
    })
  }

  var coords = generateFormation(radii, padding)
  for (var i = 0; i < ships.length; i++) {
// p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
// p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
    ships[i].physics.x = x + Math.cos(rot) * coords[i][0] - Math.sin(rot) * coords[i][1]
    ships[i].physics.y = y + Math.sin(rot) * coords[i][0] + Math.cos(rot) * coords[i][1]
    ships[i].physics.rot = rot
    ships[i].physics.xv = Math.cos(rot) * 0.25
    ships[i].physics.yv = Math.sin(rot) * 0.25
  }
}

// 0xffff4e
// 0xd91c1c

for (var i = 0; i < 4; i++) {
  recs.entity('space station', [Physics, PixiSprite, Ship], function (e) {
    e.physics.x = Math.random() * 640 * 4
    e.physics.y = Math.random() * 480 * 4
    e.physics.xv = 0
    e.physics.yv = 0
    e.physics.rotVel = Math.random() * 0.002 - 0.001
    e.ship.station = true

    e.pixiSprite = makeSprite('assets/sprites/station.png')
  })
}

recs.entity('camera', [Physics, Camera, CameraFollow], function (e) {
  e.cameraFollow.target = player
})

recs.entity('galaxy boundary indicator', [GalaxyBoundary], function () {})

recs.entity('map hud', [MapHud], function (){})

// --- run game ---

app.ticker.add(function(delta) {
  recs.tick(delta)
})


// Takes a list of radii and returns positions.
// [Float] -> [[Float, Float]]
function generateFormation (radii, padding) {
  var res = []

  if (radii.length % 2 === 0) {
    throw new Error('must be odd number of units')
  }

  var r = radii.shift()
  res.push([0, 0, r])

  var radius = res[0] ? res[0][2] : 0
  while (radii.length > 0) {
    var r = radii.shift()

    while (true) {
      var x = Math.random() * radius * 2 - radius
      var y = Math.random() * radius * 2 + r

      if (!isPointOpen(x, y, r)) {
        radius += 16
        continue
      }
      else {
        res.push([x, y, r])
        res.push([x, -y, r])
        radii.shift()
        break
      }
    }
  }

  return res

  function isPointOpen (x, y, r) {
    for (var i=0; i < res.length; i++) {
      var p = res[i]
      if (distance(x, y, p[0], p[1]) < padding * 2 + r + p[2]) {
        return false
      }
    }
    return true
  }
}

function distance (x1, y1, x2, y2) {
  var dx = x2 - x1
  var dy = y2 - y1
  return Math.sqrt(dx*dx + dy*dy)
}

function rand (a, b) {
  return Math.floor(Math.random() * (b - a + 1) + a)
}
