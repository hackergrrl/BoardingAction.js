function Health () {
  this.amount = 1
  this.max = 1
}

Health.install = function (recs) {
  recs.recv([Health], 'damage', function (e, damage) {
    e.health.amount -= damage
    // console.log(e.name, 'took', damage, 'damage')
    if (e.health.amount <= 0) {
      e.send('death')
    }
  })

  recs.recv([Health], 'death', function (e) {
    // console.log(e.name, 'died')
  })
}

module.exports = Health
