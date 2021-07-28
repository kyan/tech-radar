const Blip = require('../../src/models/blip')
const Ring = require('../../src/models/ring')

describe('Blip', function () {
  var blip

  beforeEach(function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'foo_department'
    )
  })

  it('has a name', function () {
    expect(blip.name()).toEqual('My Blip')
  })

  it('has a ring', function () {
    expect(blip.ring().name()).toEqual('My Ring')
  })

  it('has a default number', function () {
    expect(blip.number()).toEqual(-1)
  })

  it('sets the number', function () {
    blip.setNumber(1)
    expect(blip.number()).toEqual(1)
  })

  it('has a department', function () {
    expect(blip.department()).toEqual('foo_department')
  })

  it('is new', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'new'
    )

    expect(blip.isNew()).toBe(true)
  })

  it('is not new', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'unchanged'
    )

    expect(blip.isNew()).toBe(false)
  })

  it('is moved in', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'moved_in'
    )

    expect(blip.isMovedIn()).toBe(true)
  })

  it('is not moved in', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'unchanged'
    )

    expect(blip.isMovedIn()).toBe(false)
  })

  it('is moved out', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'moved_out'
    )

    expect(blip.isMovedOut()).toBe(true)
  })

  it('is not moved out', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'unchanged'
    )

    expect(blip.isMovedOut()).toBe(false)
  })

  it('is unchanged', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'unchanged'
    )

    expect(blip.isUnchanged()).toBe(true)
  })

  it('is not unchanged', function () {
    blip = new Blip(
      'My Blip',
      new Ring('My Ring'),
      'engineering',
      'new'
    )

    expect(blip.isUnchanged()).toBe(false)
  })
})
