function Projectile () {
  this.owner = null
  this.lifetime = 0
  this.def = null
}

Projectile.install = function (recs) {
  recs.recv([Projectile], 'collision', function (e, c) {
    e.remove()
  })

  recs.system('expire projectiles', [Projectile], function (e, dt) {
    e.projectile.lifetime -= dt * 1000
    if (e.projectile.lifetime <= 0) {
      e.remove()
    }
  })
}

module.exports = Projectile
