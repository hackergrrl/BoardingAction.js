function Projectile () {
  this.owner = null
  this.lifetime = 0
}

Projectile.install = function (recs) {
  recs.system('expire projectiles', [Projectile], function (e, dt) {
    e.projectile.lifetime -= dt * 1000
    if (e.projectile.lifetime <= 0) {
      e.remove()
    }
  })
}

module.exports = Projectile
