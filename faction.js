var FactionDefs = require('./faction-defs')

function Faction () {
  this.def = FactionDefs['neutral']

  this.set = function (f) {
    if (!FactionDefs[f]) {
      throw new Error('no such faction: ' + f)
    }
    this.def = FactionDefs[f]
    this.entity.send('change-faction')
  }
}

module.exports = Faction
