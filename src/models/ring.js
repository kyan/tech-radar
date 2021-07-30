const Ring = function (name, order) {
  var self = {}

  const DESCRIPTIONS = {
    'core': "Central to the work we do at Kyan. Can be used on any project.",
    'adopt': "Under the right circumstances, we think this is ready for client projects.",
    'trial': "We've assessed this and think it's worth trialing on a small, low risk project. Internal projects are ideal.",
    'assess': "We're interested in understanding whether this is something worth trialing. A typical assessment might be a 'hello world' and a dev talk.",
    'hold': "It's likely we've found an alternative that we prefer for new projects, or there are concerns about whether this is right for Kyan."
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
