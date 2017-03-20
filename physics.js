function Physics () {
  this.x = 0
  this.y = 0
  this.xv = 0
  this.yv = 0
  this.rot = 0
  this.rotVel = 0
}

module.exports.install = function (recs) {
  recs.system('basic physics', [Physics], function (d, delta) {
    d.physics.x += d.physics.xv * delta
    d.physics.y += d.physics.yv * delta
    d.physics.rot += d.physics.rotVel * delta
  })
}

module.exports.Physics = Physics
