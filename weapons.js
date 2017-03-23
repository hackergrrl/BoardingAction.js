var Physics = require('./physics')
var WeaponDefs = require('./weapon-defs')
var ProjectileDefs = require('./projectile-defs')

function Weapons () {
  this.attached = []

  this.attach = function (weaponDef, opts) {
    if (!weaponDef) throw new Error('missing weaponDef param')
    opts = opts || {}
    opts.x = opts.x || 0
    opts.y = opts.y || 0
    opts.rot = opts.rot || 0
    opts.fixed = (opts.fixed === true || opts.fixed === false) || true

    this.attached.push({
      lastFireTime: 0,
      def: weaponDef,
      x: opts.x,
      y: opts.y,
      rot: opts.rot,
      fixed: opts.fixed
    })
  }
}

Weapons.install = function (recs, app) {
  recs.on([Physics, Weapons], 'fire-weapon', function (e, idx) {
    idx = idx || 0

    var weapon = e.weapons.attached[idx]
    console.log('bang bang! shot a', WeaponDefs[weapon.def].projectileDef, 'from a', weapon.def)
  })
}

module.exports = Weapons
