var recs = require('recs')()
var PIXI = require('pixi.js')
var kb = require('kb-controls')
var mousePos = require('mouse-position')

var generateFormation = require('./gen-formation')

var Camera = require('./camera')
var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var Starfield = require('./starfield')
var GalaxyBoundary = require('./galaxy-boundary')
var MapHud = require('./map-hud')
var Ship = require('./ship')
var Weapons = require('./weapons')
var Projectile = require ('./projectile')
var Health = require('./health')
var Faction = require('./faction')

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
, '<mouse 1>': 'fire'
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
  var speed = 1.0

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

  if (ctl.fire) {
    e.send('fire-weapon', 0)
    e.send('fire-weapon', 1)
  }
})

Physics.install(recs)

Weapons.install(recs, app)

Projectile.install(recs)

Health.install(recs)

recs.system('projectile<->ship collisions',
            [Physics, Projectile], [Physics, Ship, PixiSprite],
            function (p, s) {
              if (s === p.projectile.owner) return

              var dx = p.physics.x - s.physics.x
              var dy = p.physics.y - s.physics.y
              var dist = Math.sqrt(dx*dx + dy*dy)

              if (dist <= s.pixiSprite.texture.baseTexture.width*0.5) {
                s.send('collision', p)
                p.send('collision', s)
              }
            })

Ship.install(recs)

// --- message handlers ---

recs.recv([Faction, PixiSprite], 'change-faction', function (e) {
  e.pixiSprite.tint = e.faction.def.color
})

// --- entities ---

recs.entity('star bg', [Starfield], function (e) {})

recs.entity('player ship', [Physics, PixiSprite, Ship, ShipController, Weapons, Health, Faction], function (e) {
  e.physics.x = 300
  e.physics.y = 150
  e.physics.xv = 20
  e.physics.yv = 0

  e.faction.set('unaligned')

  e.pixiSprite = makeSprite('assets/sprites/_fighter.png')

  e.weapons.attach('Fighter MG', {
    x: -9,
    y: 9,
    rot: 0,
    fixed: true
  })
  e.weapons.attach('Fighter MG', {
    x: -9,
    y: -9,
    rot: 0,
    fixed: true
  })

  player = e
})

for (var i = 0; i < 6; i++) {
  spawnFormation(
    Math.random()*640*4,
    Math.random()*480*4,
    Math.random()*Math.PI*2,
    rand(0, 1) * 2 + 1,
    Math.random() * 64,
    Math.random() < 0.5 ? 'federation' : 'unaligned')
}

for (var i = 0; i < 4; i++) {
  recs.entity('space station', [Physics, PixiSprite, Ship, Faction], function (e) {
    e.physics.x = Math.random() * 640 * 4
    e.physics.y = Math.random() * 480 * 4
    e.physics.xv = 0
    e.physics.yv = 0
    e.physics.rotVel = Math.random() * 0.002 - 0.001
    e.ship.station = true

    e.pixiSprite = makeSprite('assets/sprites/station.png')

    e.faction.set('unaligned')
  })
}

recs.entity('camera', [Physics, Camera, CameraFollow], function (e) {
  e.cameraFollow.target = player
})

recs.entity('galaxy boundary indicator', [GalaxyBoundary], function () {})

recs.entity('map hud', [MapHud], function (){})

// --- run game ---

var ticker = app.ticker.add(function() {
  recs.tick(ticker.elapsedMS / 1000)
})

// --- helpers ---

function FighterPrefab (faction, cb) {
  recs.entity('fighter ship', [Physics, PixiSprite, Ship, Health, Faction], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_fighter.png')
    e.faction.set(faction)
    cb(e)
  })
}

function GunshipPrefab (faction, cb) {
  recs.entity('gunship', [Physics, PixiSprite, Ship, Health, Faction], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_gunship.png')
    e.faction.set(faction)
    cb(e)
  })
}

function CargoshipPrefab (faction, cb) {
  recs.entity('cargo ship', [Physics, PixiSprite, Ship, Health, Faction], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_cargoship.png')
    e.faction.set(faction)
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

  var ships = []
  var radii = []

  for (var i = 0; i < major; i++) {
    if (Math.random() < 0.5) {
      GunshipPrefab(faction, function (e) {
        radii.push(e.pixiSprite.texture.baseTexture.width * 0.4)
        ships.push(e)
      })
    } else {
      CargoshipPrefab(faction, function (e) {
        radii.push(e.pixiSprite.texture.baseTexture.width * 0.4)
        ships.push(e)
      })
    }
  }
  for (var i = 0; i < minor; i++) {
    FighterPrefab(faction, function (e) {
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
    ships[i].physics.xv = Math.cos(rot) * 25
    ships[i].physics.yv = Math.sin(rot) * 25
  }
}


function rand (a, b) {
  return Math.floor(Math.random() * (b - a + 1) + a)
}
