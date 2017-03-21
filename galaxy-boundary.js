var Physics = require('./physics')

function GalaxyBoundary () {
  this.width = 640 * 4
  this.height = 480 * 4

  var graphics = new PIXI.Graphics()
  graphics.lineStyle(3, 0xff0000, 1)
  graphics.moveTo(0,0)
  graphics.lineTo(this.width, 0)
  graphics.lineTo(this.width, this.height)
  graphics.lineTo(0, this.height)
  graphics.lineTo(0,0)
  app.stage.addChild(graphics)
}

GalaxyBoundary.install = function (recs) {
  recs.system('bouncy edges', [Physics], [GalaxyBoundary], function (e, b) {
    if (e.physics.x > b.galaxyBoundary.width || e.physics.x < 0) {
      e.physics.xv *= -1
      e.physics.x += e.physics.xv
      e.physics.xv *= 0.3
    }
    if (e.physics.y > b.galaxyBoundary.height || e.physics.y < 0) {
      e.physics.yv *= -1
      e.physics.y += e.physics.yv
      e.physics.yv *= 0.3
    }
  })
}

module.exports = GalaxyBoundary
