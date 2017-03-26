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

Starfield.install = function (recs, app) {
  recs.system('scroll stars', [Starfield], function (e) {
    e.starfield.x = -app.stage.x
    e.starfield.y = -app.stage.y
    e.starfield.tilePosition.x = app.stage.x
    e.starfield.tilePosition.y = app.stage.y
  })
}

module.exports = Starfield
