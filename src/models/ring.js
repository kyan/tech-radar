const Ring = function (name, order) {
  var self = {}

  const DESCRIPTIONS = {
    'Core': 'Core tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Adopt': 'Adopt tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Assess': 'Assess tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Trial': 'Trial tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Hold': 'Hold tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  }

  self.name = function () {
    return name
  }

  self.description = function () {
    return DESCRIPTIONS[name]
  }

  self.order = function () {
    return order
  }

  return self
}

module.exports = Ring
