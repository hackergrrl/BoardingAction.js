var recs = require('recs')()
var PIXI = require('pixi.js')

var Camera = require('./camera').Camera
var Physics = require('./physics').Physics
var PixiSprite = require('./pixi-sprite').PixiSprite
var Starfield = require('./starfield').Starfield

// --- app setup ---
var app = new PIXI.Application(640, 480, {backgroundColor : 0x101644})
document.body.appendChild(app.view)
global.app = app

// --- import systems ---
require('./camera').install(recs, app)
require('./starfield').install(recs, app)
require('./physics').install(recs)
require('./pixi-sprite').install(recs)

// --- helper functions ---
function makeSprite (imagePath) {
  var sprite = PIXI.Sprite.fromImage(imagePath)
  sprite.anchor.set(0.5)
  app.stage.addChild(sprite)
  return sprite
}

// --- components ---

// --- systems ---

// --- entities ---

recs.entity('star bg', [Starfield], function (e) {})

var Ship = [Physics, PixiSprite]
recs.entity('player ship', Ship, function (e) {
  e.physics.x = 300
  e.physics.y = 150
  e.physics.xv = 0.5
  e.physics.yv = 0
  e.physics.rotVel = 0.1

  e.pixiSprite = makeSprite('assets/sprites/fighter.png')
})

recs.entity('camera', [Physics, Camera], function (e) {})

// --- run game ---

app.ticker.add(function(delta) {
  recs.tick(delta)
})

