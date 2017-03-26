var Health = require('./health')
var Projectile = require('./projectile')

function Ship () {
}

Ship.install = function (recs) {
  recs.recv([Ship, Health], 'collision', function (e, c) {
    if (c.projectile) {
      e.send('damage', c.projectile.def.damage)
    }
  })

  recs.recv([Ship], 'death', function (e) {
    e.remove()
  })
}

module.exports = Ship
