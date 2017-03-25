var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var WeaponDefs = require('./weapon-defs')
var ProjectileDefs = require('./projectile-defs')
var Projectile = require ('./projectile')
var rotatePoint = require('./rotate-point')

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
  recs.recv([Physics, Weapons], 'fire-weapon', function (e, idx) {
    idx = idx || 0

    var weapon = e.weapons.attached[idx]
    if (!weapon) return

    var weaponDef = WeaponDefs[weapon.def]
    var projDef = ProjectileDefs[weaponDef.projectileDef]

    var now = (new Date()).getTime()
    if (now - weapon.lastFireTime > weaponDef.fireRate) {
      weapon.lastFireTime = now
    } else {
      return
    }

    // TODO: maybe fire an event /w the projectile?

    recs.entity('projectile', [Physics, PixiSprite, Projectile], function (p) {
      var proj = new PIXI.Sprite.fromImage('assets/sprites/bullet.png')
      proj.scale.x = projDef.lineLength / 32
      proj.scale.y = projDef.lineWidth
      proj.tint = projDef.lineColor
      app.stage.addChild(proj)
      p.pixiSprite = proj

      p.projectile.owner = e

      var pt = rotatePoint(weapon.x, weapon.y, e.physics.rot)
      // var pt = rotatePoint(0, 0, e.physics.rot)

      p.physics.x = e.physics.x + pt[0]
      p.physics.y = e.physics.y + pt[1]
      p.physics.rot = e.physics.rot
      p.physics.xv = Math.cos(p.physics.rot) * projDef.speed
      p.physics.yv = Math.sin(p.physics.rot) * projDef.speed
    })
    // console.log('bang bang! shot a', WeaponDefs[weapon.def].projectileDef, 'from a', weapon.def)
  })
}

module.exports = Weapons
