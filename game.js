var recs = require('recs')()
var PIXI = require('pixi.js')
var kb = require('kb-controls')

var Camera = require('./camera')
var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var Starfield = require('./starfield')

// --- app setup ---
var app = new PIXI.Application(640, 480, {backgroundColor : 0x101644})
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

// --- install systems ---
Camera.install(recs, app)
Starfield.install(recs, app)
Physics.install(recs)
PixiSprite.install(recs)

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

  e.pixiSprite = makeSprite('assets/sprites/fighter.png')

  player = e
})

recs.entity('camera', [Physics, Camera, CameraFollow], function (e) {
  e.cameraFollow.target = player
})

// --- run game ---

app.ticker.add(function(delta) {
  recs.tick(delta)
})

