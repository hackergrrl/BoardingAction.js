var recs = require('recs')()
var PIXI = require('pixi.js')
var kb = require('kb-controls')
var mousePos = require('mouse-position')

var Camera = require('./camera')
var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var Starfield = require('./starfield')
var GalaxyBoundary = require('./galaxy-boundary')

// --- app setup ---
document.body.style.margin = '0px'
document.body.style.overflow = 'hidden'
var app = new PIXI.Application(window.innerWidth, window.innerHeight, {
  backgroundColor : 0x101644
})
document.body.appendChild(app.view)
global.app = app

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

// --- install systems ---
Camera.install(recs, app)
Starfield.install(recs, app)
Physics.install(recs)
PixiSprite.install(recs)
GalaxyBoundary.install(recs)

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

recs.system('camera follow', [Camera, Physics, CameraFollow], function (e) {
  if (e.cameraFollow.target) {
    e.physics.x = e.cameraFollow.target.physics.x - app.renderer.width/2
    e.physics.y = e.cameraFollow.target.physics.y - app.renderer.height/2
  }
})

// --- entities ---

recs.entity('star bg', [Starfield], function (e) {})

var Ship = [Physics, PixiSprite, ShipController]
var player
recs.entity('player ship', Ship, function (e) {
  e.physics.x = 300
  e.physics.y = 150
  e.physics.xv = 0.5
  e.physics.yv = 0

  e.pixiSprite = makeSprite('assets/sprites/_fighter.png')

  player = e
})

var FighterPrefab = function (faction, cb) {
  recs.entity('fighter ship', [Physics, PixiSprite], function (e) {
    e.pixiSprite = makeSprite('assets/sprites/_fighter.png')
    e.pixiSprite.tint = 0xd91c1c
    cb(e)
  })
}

recs.entity('federation gunship', [Physics, PixiSprite], function (e) {
  e.physics.x = 200
  e.physics.y = 350
  e.physics.xv = 0.25
  e.physics.yv = 0
  e.pixiSprite = makeSprite('assets/sprites/_gunship.png')
  e.pixiSprite.tint = 0xd91c1c
})
FighterPrefab(0xd91c1c, function (e) {
  e.physics.x = 280
  e.physics.y = 280
  e.physics.xv = 0.25
  e.physics.yv = 0
})
FighterPrefab(0xd91c1c, function (e) {
  e.physics.x = 280
  e.physics.y = 420
  e.physics.xv = 0.25
  e.physics.yv = 0
})
recs.entity('civilian cargo ship', [Physics, PixiSprite], function (e) {
  e.physics.x = 100
  e.physics.y = 100
  e.physics.xv = 0.15
  e.physics.yv = 0.15
  e.physics.rot = Math.PI / 4
  e.pixiSprite = makeSprite('assets/sprites/_cargoship.png')
  e.pixiSprite.tint = 0xffff4e
})

for (var i = 0; i < 4; i++) {
  recs.entity('space station', [Physics, PixiSprite], function (e) {
    e.physics.x = Math.random() * 640 * 4
    e.physics.y = Math.random() * 480 * 4
    e.physics.xv = 0
    e.physics.yv = 0
    e.physics.rotVel = Math.random() * 0.002 - 0.001

    e.pixiSprite = makeSprite('assets/sprites/station.png')
  })
}

recs.entity('camera', [Physics, Camera, CameraFollow], function (e) {
  e.cameraFollow.target = player
})

recs.entity('galaxy boundary indicator', [GalaxyBoundary], function () {})

// --- run game ---

app.ticker.add(function(delta) {
  recs.tick(delta)
})

