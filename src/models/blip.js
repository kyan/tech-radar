const IDEAL_BLIP_WIDTH = 28

const STATUSES = {
  NEW: 'new',
  MOVED_IN: 'moved_in',
  MOVED_OUT: 'moved_out',
  UNCHANGED: 'unchanged',
}

const DEPARTMENTS = {
  ENGINEERING: 'Engineering',
  DESIGN: 'Design',
  QA: 'QA',
}

const Blip = function (name, ring, department, status, topic, description) {
  var self, number

  self = {}
  number = -1

  self.width = IDEAL_BLIP_WIDTH

  self.name = function () {
    return name
  }

  self.topic = function () {
    return topic || ''
  }

  self.description = function () {
    return description || ''
  }

  self.department = function () {
    return department
  }

  self.isNew = function () {
    return status === STATUSES.NEW
  }

  self.isMovedIn = function () {
    return status === STATUSES.MOVED_IN
  }

  self.isMovedOut = function () {
    return status === STATUSES.MOVED_OUT
  }

  self.isUnchanged = function () {
    return status === STATUSES.UNCHANGED
  }

  self.ring = function () {
    return ring
  }

  self.number = function () {
    return number
  }

  self.setNumber = function (newNumber) {
    number = newNumber
  }

  return self
}

module.exports = Blip
