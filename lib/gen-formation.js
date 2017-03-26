module.exports = generateFormation

// Takes a list of radii and returns positions.
// [Float] -> [[Float, Float]]
function generateFormation (radii, padding) {
  var res = []

  if (radii.length % 2 === 0) {
    throw new Error('must be odd number of units')
  }

  var r = radii.shift()
  res.push([0, 0, r])

  var radius = res[0] ? res[0][2] : 0
  while (radii.length > 0) {
    var r = radii.shift()

    while (true) {
      var x = Math.random() * radius * 2 - radius
      var y = Math.random() * radius * 2 + r

      if (!isPointOpen(x, y, r)) {
        radius += 16
        continue
      }
      else {
        res.push([x, y, r])
        res.push([x, -y, r])
        radii.shift()
        break
      }
    }
  }

  return res

  function isPointOpen (x, y, r) {
    for (var i=0; i < res.length; i++) {
      var p = res[i]
      if (distance(x, y, p[0], p[1]) < padding * 2 + r + p[2]) {
        return false
      }
    }
    return true
  }
}

function distance (x1, y1, x2, y2) {
  var dx = x2 - x1
  var dy = y2 - y1
  return Math.sqrt(dx*dx + dy*dy)
}

