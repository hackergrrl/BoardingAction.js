var recs = require('recs')()
var PIXI = require('pixi.js')

var app = new PIXI.Application(640, 480, {backgroundColor : 0x101644})
document.body.appendChild(app.view)

// --- components ---

function Sprite () {
  var sprite = PIXI.Sprite.fromImage('assets/sprites/bunny.png')
  sprite.anchor.set(0.5)
  app.stage.addChild(sprite)
  return sprite
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

function Camera () {
}

function Body () {
  this.x = 0
  this.y = 0
  this.xv = 0
  this.yv = 0
  this.rot = 0
  this.rotVel = 0
}

// --- systems ---

recs.system('scroll stars', [Starfield], function (e) {
  e.starfield.x = -app.stage.x
  e.starfield.y = -app.stage.y
  e.starfield.tilePosition.x = app.stage.x
  e.starfield.tilePosition.y = app.stage.y
})

recs.system('auto-pan camera', [Body, Camera], function (e) {
  e.body.x += 0.2
  e.body.y += 0.3

  app.stage.x = -e.body.x
  app.stage.y = -e.body.y
})

recs.system('basic physics', [Body], function (d, delta) {
  d.body.x += d.body.xv * delta
  d.body.y += d.body.yv * delta
  d.body.rot += d.body.rotVel * delta
})

recs.system('sync body<->sprite', [Body, Sprite], function (e) {
  e.sprite.x = e.body.x
  e.sprite.y = e.body.y
  e.sprite.rotation = e.body.rot
})

// --- entities ---

recs.entity([Body, Camera], function (e) {
})

recs.entity([Starfield], function (e) {
})

for (var i=0; i < 10; i++) {
  recs.entity([Body, Sprite], function (e) {
    e.body.x = 300
    e.body.y = 200 - i * 10
    e.body.xv = 1
    e.body.yv = 0

    e.sprite.scale.x = 0.5 + i * 0.2
    e.sprite.scale.y = 0.5 + i * 0.2

    e.body.rotVel = 0.1
  })
}

app.ticker.add(function(delta) {
  recs.tick(delta)
})
