module.exports = function (x, y, rot) {
  return [
    Math.cos(rot) * x - Math.sin(rot) * y,
    Math.sin(rot) * x + Math.cos(rot) * y
  ]
}
