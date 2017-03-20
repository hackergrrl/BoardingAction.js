var recs = require('recs')()
var PIXI = require('pixi.js')

var app = new PIXI.Application(640, 480, {backgroundColor : 0x101644})
document.body.appendChild(app.view)

require('./camera').install(recs, app)
require('./physics').install(recs)

var Physics = require('./physics').Physics

function makeSprite (imagePath) {
  var sprite = PIXI.Sprite.fromImage(imagePath)
  sprite.anchor.set(0.5)
  app.stage.addChild(sprite)
  return sprite
}

// --- components ---

function PixiSprite () {
}

function Starfield () {
  var sprite = PIXI.extras.TilingSprite.fromImage('assets/sprites/stars.png')
  sprite.width = app.renderer.width
  sprite.height = app.renderer.height
  sprite.tileScale.x = 0.5
  sprite.tileScale.y = 0.5
  sprite.anchor.set(0, 0)
  app.stage.addChild(sprite)
  return sprite
}

// --- systems ---

recs.system('scroll stars', [Starfield], function (e) {
  e.starfield.x = -app.stage.x
  e.starfield.y = -app.stage.y
  e.starfield.tilePosition.x = app.stage.x
  e.starfield.tilePosition.y = app.stage.y
})

recs.system('sync physics<->pixiSprite', [Physics, PixiSprite], function (e) {
  e.pixiSprite.x = e.physics.x
  e.pixiSprite.y = e.physics.y
  e.pixiSprite.rotation = e.physics.rot
})

// --- entities ---

recs.entity('star bg', [Starfield], function (e) {
})

var Ship = [Physics, PixiSprite]
recs.entity('player ship', Ship, function (e) {
  e.physics.x = 300
  e.physics.y = 150
  e.physics.xv = 0.5
  e.physics.yv = 0
  e.physics.rotVel = 0.1

  e.pixiSprite = makeSprite('assets/sprites/fighter.png')
})

// --- run game ---

app.ticker.add(function(delta) {
  recs.tick(delta)
})

