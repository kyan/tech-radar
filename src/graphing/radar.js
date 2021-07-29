const d3 = require('d3')
const d3tip = require('d3-tip')
const Chance = require('chance')
const _ = require('lodash/core')
const tippy = require('tippy.js').default

const RingCalculator = require('../util/ringCalculator')
const AutoComplete = require('../util/autoComplete')

const MIN_BLIP_WIDTH = 12
const ANIMATION_DURATION = 1000

const Radar = function (size, radar) {
  var svg, radarElement, quadrantButtons, buttonsGroup, header, alternativeDiv

  var tip = d3tip().attr('class', 'd3-tip').html(function (text) {
    return text
  })

  tip.direction(function () {
    if (d3.select('.quadrant-table.selected').node()) {
      var selectedQuadrant = d3.select('.quadrant-table.selected')
      if (selectedQuadrant.classed('first') || selectedQuadrant.classed('fourth')) { return 'ne' } else { return 'nw' }
    }
    return 'n'
  })

  var ringCalculator = new RingCalculator(radar.rings().length, center())

  var self = {}
  var chance

  function center () {
    return Math.round(size / 2)
  }

  function toRadian (angleInDegrees) {
    return Math.PI * angleInDegrees / 180
  }

  function plotLines (quadrantGroup, quadrant) {
    var startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2)
    var endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2)

    var startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2)
    var endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2)

    if (startY > endY) {
      var aux = endY
      endY = startY
      startY = aux
    }

    quadrantGroup.append('line')
      .attr('x1', center()).attr('x2', center())
      .attr('y1', startY - 2).attr('y2', endY + 2)
      .attr('stroke-width', 10)

    quadrantGroup.append('line')
      .attr('x1', endX).attr('y1', center())
      .attr('x2', startX).attr('y2', center())
      .attr('stroke-width', 10)
  }

  function plotQuadrant (rings, quadrant) {
    var quadrantGroup = svg.append('g')
      .attr('class', 'quadrant-group quadrant-group-' + quadrant.order)
      .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
      .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
      .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))

    rings.forEach(function (ring, i) {
      var arc = d3.arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + 1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - 90))

      quadrantGroup.append('path')
        .attr('d', arc)
        .attr('class', 'ring-arc-' + ring.order())
        .attr('transform', 'translate(' + center() + ', ' + center() + ')')
    })

    return quadrantGroup
  }

  function plotTexts (quadrantGroup, rings, quadrant) {
    rings.forEach(function (ring, i) {
      if (quadrant.order === 'first' || quadrant.order === 'fourth') {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + 4)
          .attr('x', center() + (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring.name())
      } else {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + 4)
          .attr('x', center() - (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring.name())
      }
    })
  }

  //Circules
  const BLIP_PATHS = {
    new: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    // TODO: modify the moved_in_N_quadrant & moved_out_N_quadrant paths to add the partial halos
    moved_in_first_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_in_second_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_in_third_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_in_fourth_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_out_first_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_out_second_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_out_third_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
    moved_out_fourth_quadrant: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',

    unchanged: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
  }

  //Different shapes
  // const BLIP_PATHS = {
  //   new: 'M434.5,297.5c0,7.5-6.1,13.7-13.7,13.7c-7.5,0-13.7-6.1-13.7-13.7c0-7.5,6.1-13.6,13.7-13.6C428.4,283.9,434.5,290,434.5,297.5z',
  //   // TODO: modify the moved_in_N_quadrant & moved_out_N_quadrant paths to add the partial halos
  //   moved_in_first_quadrant: 'M421,284l-14.1,10.2c-0.1,0.1-0.1,0.2-0.1,0.3l5.4,16.5c0,0.1,0.1,0.2,0.2,0.2h17.4c0.1,0,0.2-0.1,0.2-0.2l5.4-16.5c0-0.1,0-0.2-0.1-0.3L421.2,284C421.2,283.9,421,283.9,421,284z',
  //   moved_in_second_quadrant: 'M421,284l-14.1,10.2c-0.1,0.1-0.1,0.2-0.1,0.3l5.4,16.5c0,0.1,0.1,0.2,0.2,0.2h17.4c0.1,0,0.2-0.1,0.2-0.2l5.4-16.5c0-0.1,0-0.2-0.1-0.3L421.2,284C421.2,283.9,421,283.9,421,284z',
  //   moved_in_third_quadrant: 'M421,284l-14.1,10.2c-0.1,0.1-0.1,0.2-0.1,0.3l5.4,16.5c0,0.1,0.1,0.2,0.2,0.2h17.4c0.1,0,0.2-0.1,0.2-0.2l5.4-16.5c0-0.1,0-0.2-0.1-0.3L421.2,284C421.2,283.9,421,283.9,421,284z',
  //   moved_in_fourth_quadrant: 'M421,284l-14.1,10.2c-0.1,0.1-0.1,0.2-0.1,0.3l5.4,16.5c0,0.1,0.1,0.2,0.2,0.2h17.4c0.1,0,0.2-0.1,0.2-0.2l5.4-16.5c0-0.1,0-0.2-0.1-0.3L421.2,284C421.2,283.9,421,283.9,421,284z',
  //   moved_out_first_quadrant: 'M421,311.1l14.1-10.2c0.1-0.1,0.1-0.2,0.1-0.3l-5.4-16.5c0-0.1-0.1-0.2-0.2-0.2h-17.4c-0.1,0-0.2,0.1-0.2,0.2l-5.4,16.5c0,0.1,0,0.2,0.1,0.3l14.1,10.2C420.8,311.2,420.9,311.2,421,311.1z',
  //   moved_out_second_quadrant: 'M421,311.1l14.1-10.2c0.1-0.1,0.1-0.2,0.1-0.3l-5.4-16.5c0-0.1-0.1-0.2-0.2-0.2h-17.4c-0.1,0-0.2,0.1-0.2,0.2l-5.4,16.5c0,0.1,0,0.2,0.1,0.3l14.1,10.2C420.8,311.2,420.9,311.2,421,311.1z',
  //   moved_out_third_quadrant: 'M421,311.1l14.1-10.2c0.1-0.1,0.1-0.2,0.1-0.3l-5.4-16.5c0-0.1-0.1-0.2-0.2-0.2h-17.4c-0.1,0-0.2,0.1-0.2,0.2l-5.4,16.5c0,0.1,0,0.2,0.1,0.3l14.1,10.2C420.8,311.2,420.9,311.2,421,311.1z',
  //   moved_out_fourth_quadrant: 'M421,311.1l14.1-10.2c0.1-0.1,0.1-0.2,0.1-0.3l-5.4-16.5c0-0.1-0.1-0.2-0.2-0.2h-17.4c-0.1,0-0.2,0.1-0.2,0.2l-5.4,16.5c0,0.1,0,0.2,0.1,0.3l14.1,10.2C420.8,311.2,420.9,311.2,421,311.1z',

  //   unchanged: 'M434.4,311.2h-27c-0.1,0-0.1-0.1-0.1-0.1V284c0-0.1,0.1-0.1,0.1-0.1h27c0.1,0,0.1,0.1,0.1,0.1v27.1C434.5,311.1,434.4,311.2,434.4,311.2z',
  // }

  function newBlip (blip, x, y, order, group) {
    return group.append('path').attr('d', BLIP_PATHS.new)
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', blip.department)
  }

  function newLegend (x, y, group) {
    return group.append('path').attr('d', BLIP_PATHS.new)
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
  }

  function movedInBlip (blip, x, y, order, group) {
    return group.append('path').attr('d', BLIP_PATHS['moved_in_' + order + '_quadrant'])
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', blip.department)
  }

  function movedInLegend (x, y, group, order) {
    return group.append('path').attr('d', BLIP_PATHS['moved_in_' + order + '_quadrant'])
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
  }

  function movedOutBlip (blip, x, y, order, group) {
    return group.append('path').attr('d', BLIP_PATHS['moved_out_' + order + '_quadrant'])
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', blip.department)
  }

  function movedOutLegend (x, y, group, order) {
    return group.append('path').attr('d', BLIP_PATHS['moved_out_' + order + '_quadrant'])
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
  }

  function unchangedBlip (blip, x, y, order, group) {
    return (group || svg).append('path')
      .attr('d', BLIP_PATHS.unchanged)
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', blip.department)
  }

  function unchangedLegend (x, y, group) {
    return (group || svg).append('path')
      .attr('d', 'M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092')
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
  }

  function addRing (name, description, order) {
    var table = d3.select('.quadrant-table.' + order)
    table.append('h3')
      .text(name)
      .append('span')
      .attr('data-tippy-content', description)
      .text('?')
    return table.append('ul')
  }

  function calculateBlipCoordinates (blip, chance, minRadius, maxRadius, startAngle) {
    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    var adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle))

    var radius = chance.floating({ min: minRadius + blip.width / 2, max: maxRadius - blip.width / 2 })
    var angleDelta = Math.asin(blip.width / 2 / radius) * 180 / Math.PI
    angleDelta = angleDelta > 45 ? 45 : angleDelta
    var angle = toRadian(chance.integer({ min: angleDelta, max: 90 - angleDelta }))

    var x = center() + radius * Math.cos(angle) * adjustX
    var y = center() + radius * Math.sin(angle) * adjustY

    return [x, y]
  }

  function thereIsCollision (blip, coordinates, allCoordinates) {
    return allCoordinates.some(function (currentCoordinates) {
      return (Math.abs(currentCoordinates[0] - coordinates[0]) < blip.width) && (Math.abs(currentCoordinates[1] - coordinates[1]) < blip.width)
    })
  }

  function plotBlips (quadrantGroup, rings, quadrantWrapper) {
    var blips, quadrant, startAngle, order

    quadrant = quadrantWrapper.quadrant
    startAngle = quadrantWrapper.startAngle
    order = quadrantWrapper.order

    d3.select('.quadrant-table.' + order)
      .append('h2')
      .attr('class', 'quadrant-table__name')
      .text(quadrant.name())

    blips = quadrant.blips()
    rings.forEach(function (ring, i) {
      var ringBlips = blips.filter(function (blip) {
        return blip.ring() === ring
      })

      if (ringBlips.length === 0) {
        return
      }

      var maxRadius, minRadius

      minRadius = ringCalculator.getRadius(i)
      maxRadius = ringCalculator.getRadius(i + 1)

      var sumRing = ring.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      var sumQuadrant = quadrant.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      chance = new Chance(Math.PI * sumRing * ring.name().length * sumQuadrant * quadrant.name().length)

      var ringList = addRing(ring.name(), ring.description(), order)
      var allBlipCoordinatesInRing = []

      tippy('[data-tippy-content]');

      ringBlips.forEach(function (blip) {
        const coordinates = findBlipCoordinates(blip,
          minRadius,
          maxRadius,
          startAngle,
          allBlipCoordinatesInRing)

        allBlipCoordinatesInRing.push(coordinates)
        drawBlipInCoordinates(blip, coordinates, order, quadrantGroup, ringList)
      })
    })
  }

  function findBlipCoordinates (blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing) {
    const maxIterations = 200
    var coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
    var iterationCounter = 0
    var foundAPlace = false

    while (iterationCounter < maxIterations) {
      if (thereIsCollision(blip, coordinates, allBlipCoordinatesInRing)) {
        coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
      } else {
        foundAPlace = true
        break
      }
      iterationCounter++
    }

    if (!foundAPlace && blip.width > MIN_BLIP_WIDTH) {
      blip.width = blip.width - 1
      return findBlipCoordinates(blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing)
    } else {
      return coordinates
    }
  }

  function drawBlipInCoordinates (blip, coordinates, order, quadrantGroup, ringList) {
    var x = coordinates[0]
    var y = coordinates[1]

    var group = quadrantGroup.append('g').attr('class', 'blip-link').attr('id', 'blip-link-' + blip.number())

    if (blip.isNew()) {
      newBlip(blip, x, y, order, group)
    } else if (blip.isMovedIn()) {
      movedInBlip(blip, x, y, order, group)
    } else if (blip.isMovedOut()) {
      movedOutBlip(blip, x, y, order, group)
    } else { // unchanged
      unchangedBlip(blip, x, y, order, group)
    }

    group.append('text')
      .attr('x', x)
      .attr('y', y + 4)
      .attr('class', 'blip-text')
      // derive font-size from current blip width
      .style('font-size', ((blip.width * 10) / 22) + 'px')
      .attr('text-anchor', 'middle')
      .text(blip.number())

    var blipListItem = ringList.append('li')
    var blipText = blip.number() + '. ' + blip.name() + (blip.topic() ? ('. - ' + blip.topic()) : '')
    blipListItem.append('div')
      .attr('class', 'blip-list-item')
      .attr('id', 'blip-list-item-' + blip.number())
      .text(blipText)

    var blipItemDescription = blipListItem.append('div')
      .attr('id', 'blip-description-' + blip.number())
      .attr('class', 'blip-item-description')
    if (blip.description()) {
      blipItemDescription.append('div').html(blip.description())
    }

    var mouseOver = function () {
      d3.selectAll('g.blip-link').attr('opacity', 0.3)
      group.attr('opacity', 1.0)
      blipListItem.selectAll('.blip-list-item').classed('highlight', true)
      tip.show(blip.name(), group.node())
    }

    var mouseOut = function () {
      d3.selectAll('g.blip-link').attr('opacity', 1.0)
      blipListItem.selectAll('.blip-list-item').classed('highlight', false)
      tip.hide().style('left', 0).style('top', 0)
    }

    blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut)
    group.on('mouseover', mouseOver).on('mouseout', mouseOut)

    var clickBlip = function () {
      d3.select('.blip-item-description.expanded').node() !== blipItemDescription.node() &&
        d3.select('.blip-item-description.expanded').classed('expanded', false)
      blipItemDescription.classed('expanded', !blipItemDescription.classed('expanded'))

      blipItemDescription.on('click', function () {
        d3.event.stopPropagation()
      })
    }

    blipListItem.on('click', clickBlip)
  }

  function removeHomeLink () {
    d3.select('.home-link').remove()
  }

  function createHomeLink (pageElement) {
    if (pageElement.select('.home-link').empty()) {
      pageElement.insert('div', 'div#alternative-buttons')
        .html('&#171; Back to Radar home')
        .classed('home-link', true)
        .classed('selected', true)
        .on('click', redrawFullRadar)
        .append('g')
        .attr('fill', '#626F87')
        .append('path')
        .attr('d', 'M27.6904224,13.939279 C27.6904224,13.7179572 27.6039633,13.5456925 27.4314224,13.4230122 L18.9285959,6.85547454 C18.6819796,6.65886965 18.410898,6.65886965 18.115049,6.85547454 L9.90776939,13.4230122 C9.75999592,13.5456925 9.68592041,13.7179572 9.68592041,13.939279 L9.68592041,25.7825947 C9.68592041,25.979501 9.74761224,26.1391059 9.87092041,26.2620876 C9.99415306,26.3851446 10.1419265,26.4467108 10.3145429,26.4467108 L15.1946918,26.4467108 C15.391698,26.4467108 15.5518551,26.3851446 15.6751633,26.2620876 C15.7984714,26.1391059 15.8600878,25.979501 15.8600878,25.7825947 L15.8600878,18.5142424 L21.4794061,18.5142424 L21.4794061,25.7822933 C21.4794061,25.9792749 21.5410224,26.1391059 21.6643306,26.2620876 C21.7876388,26.3851446 21.9477959,26.4467108 22.1448776,26.4467108 L27.024951,26.4467108 C27.2220327,26.4467108 27.3821898,26.3851446 27.505498,26.2620876 C27.6288061,26.1391059 27.6904224,25.9792749 27.6904224,25.7822933 L27.6904224,13.939279 Z M18.4849735,0.0301425662 C21.0234,0.0301425662 23.4202449,0.515814664 25.6755082,1.48753564 C27.9308469,2.45887984 29.8899592,3.77497963 31.5538265,5.43523218 C33.2173918,7.09540937 34.5358755,9.05083299 35.5095796,11.3015031 C36.4829061,13.5518717 36.9699469,15.9439104 36.9699469,18.4774684 C36.9699469,20.1744196 36.748098,21.8101813 36.3044755,23.3844521 C35.860551,24.9584216 35.238498,26.4281731 34.4373347,27.7934053 C33.6362469,29.158336 32.6753041,30.4005112 31.5538265,31.5197047 C30.432349,32.6388982 29.1876388,33.5981853 27.8199224,34.3973401 C26.4519041,35.1968717 24.9791531,35.8176578 23.4016694,36.2606782 C21.8244878,36.7033971 20.1853878,36.9247943 18.4849735,36.9247943 C16.7841816,36.9247943 15.1453837,36.7033971 13.5679755,36.2606782 C11.9904918,35.8176578 10.5180429,35.1968717 9.15002449,34.3973401 C7.78223265,33.5978839 6.53752245,32.6388982 5.41612041,31.5197047 C4.29464286,30.4005112 3.33339796,29.158336 2.53253673,27.7934053 C1.73144898,26.4281731 1.10909388,24.9584216 0.665395918,23.3844521 C0.22184898,21.8101813 0,20.1744196 0,18.4774684 C0,16.7801405 0.22184898,15.1446802 0.665395918,13.5704847 C1.10909388,11.9962138 1.73144898,10.5267637 2.53253673,9.16153157 C3.33339796,7.79652546 4.29464286,6.55435031 5.41612041,5.43523218 C6.53752245,4.3160387 7.78223265,3.35675153 9.15002449,2.55752138 C10.5180429,1.75806517 11.9904918,1.13690224 13.5679755,0.694183299 C15.1453837,0.251464358 16.7841816,0.0301425662 18.4849735,0.0301425662 L18.4849735,0.0301425662 Z')
    }
  }

  function removeRadarLegend () {
    d3.select('.legend').remove()
  }

  function drawLegend (order) {
    removeRadarLegend()

    var newKey = 'New'
    var movedInKey = 'Moved In'
    var movedOutKey = 'Moved Out'
    var unchangedKey = 'No change'

    var container = d3.select('svg').append('g')
      .attr('class', 'legend legend' + '-' + order)

    var x = 10
    var y = 10

    if (order === 'first') {
      x = 4 * size / 5
      y = 1 * size / 5
    }

    if (order === 'second') {
      x = 1 * size / 5 - 15
      y = 1 * size / 5 - 20
    }

    if (order === 'third') {
      x = 1 * size / 5 - 15
      y = 4 * size / 5 + 15
    }

    if (order === 'fourth') {
      x = 4 * size / 5
      y = 4 * size / 5
    }

    d3.select('.legend')
      .attr('class', 'legend legend-' + order)
      .transition()
      .style('visibility', 'visible')

    newLegend(x, y, container)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 5)
      .attr('font-size', '0.8em')
      .text(newKey)

    movedInLegend(x, y + 20, container, order)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 25)
      .attr('font-size', '0.8em')
      .text(movedInKey)

    movedOutLegend(x, y + 40, container, order)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 45)
      .attr('font-size', '0.8em')
      .text(movedOutKey)

    unchangedLegend(x, y + 60, container)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 65)
      .attr('font-size', '0.8em')
      .text(unchangedKey)
  }

  function redrawFullRadar () {
    removeHomeLink()
    removeRadarLegend()
    tip.hide()
    d3.selectAll('g.blip-link').attr('opacity', 1.0)

    svg.style('left', 0).style('right', 0)

    d3.selectAll('.button')
      .classed('selected', false)
      .classed('full-view', true)

    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll('.home-link').classed('selected', false)

    d3.selectAll('.quadrant-group')
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll('.quadrant-group .blip-link')
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto')
  }

  function searchBlip (_e, ui) {
    const { blip, quadrant } = ui.item
    const isQuadrantSelected = d3.select('div.button.' + quadrant.order).classed('selected')
    selectQuadrant.bind({}, quadrant.order, quadrant.startAngle)()
    const selectedDesc = d3.select('#blip-description-' + blip.number())
    d3.select('.blip-item-description.expanded').node() !== selectedDesc.node() &&
        d3.select('.blip-item-description.expanded').classed('expanded', false)
    selectedDesc.classed('expanded', true)

    d3.selectAll('g.blip-link').attr('opacity', 0.3)
    const group = d3.select('#blip-link-' + blip.number())
    group.attr('opacity', 1.0)
    d3.selectAll('.blip-list-item').classed('highlight', false)
    d3.select('#blip-list-item-' + blip.number()).classed('highlight', true)
    if (isQuadrantSelected) {
      tip.show(blip.name(), group.node())
    } else {
      // need to account for the animation time associated with selecting a quadrant
      tip.hide()

      setTimeout(function () {
        tip.show(blip.name(), group.node())
      }, ANIMATION_DURATION)
    }
  }

  function plotRadarHeader () {
    header = d3.select('body').insert('header', '#radar')

    header.append('div')
      .attr('class', 'radar-title')
      .append('div')
      .attr('class', 'radar-title__logo')
      .html('<img src="/images/kyan.svg" />')

    header.select('.radar-title')
      .append('div')
      .attr('class', 'radar-title__text')
      .append('h1')
      .text(document.title)
      .style('cursor', 'pointer')
      .on('click', redrawFullRadar)

    header.select('.radar-title')
      .append('p')
      .attr('class', 'radar-title__description')
      .text('Libero, id proin eu nunc pulvinar nibh mus suspendisse in. Sollicitudin tristique turpis purus lacus, arcu non nec vivamus bibendum. Quam ornare nullam at pharetra, fringilla.')

    buttonsGroup = header.append('div')
      .classed('buttons-group', true)

    quadrantButtons = buttonsGroup.append('div')
      .classed('quadrant-btn--group', true)

    teamKey = header.append('div')
      .classed('team-key', true)
      .append('ul')
      .attr('class', 'team-key__list')


    //Design team
    teamKey = header.select('.team-key__list')
      .append('li')
      .attr('class', 'team-key__team team-key__team--design')
      .append('div')
      .attr('class', 'team-key__box team-key__box--desing')

    teamKey = header.select('.team-key__team--design')
      .append('p')
      .attr('class', 'team-key__title')
      .text('Design')

    //QA team
    teamKey = header.select('.team-key__list')
      .append('li')
      .attr('class', 'team-key__team team-key__team--qa')
      .append('div')
      .attr('class', 'team-key__box team-key__box--qa')

    teamKey = header.select('.team-key__team--qa')
      .append('p')
      .attr('class', 'team-key__title')
      .text('QA')

    //Engineering team
    teamKey = header.select('.team-key__list')
      .append('li')
      .attr('class', 'team-key__team team-key__team--engineering')
      .append('div')
      .attr('class', 'team-key__box  team-key__box--engineering')

    teamKey = header.select('.team-key__team--engineering')
      .append('p')
      .attr('class', 'team-key__title')
      .text('Engineering')


    alternativeDiv = header.append('div')
      .attr('id', 'alternative-buttons')

    return header
  }

  function plotQuadrantButtons (quadrants, header) {
    function addButton (quadrant) {
      radarElement
        .append('div')
        .attr('class', 'quadrant-table ' + quadrant.order)

      quadrantButtons.append('div')
        .attr('class', 'button ' + quadrant.order + ' full-view')
        .text(quadrant.quadrant.name())
        .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
        .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
        .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))
    }

    _.each([0, 1, 2, 3], function (i) {
      addButton(quadrants[i])
    })

    buttonsGroup.append('div')
      .classed('search-box', true)
      .append('input')
      .attr('id', 'auto-complete')
      .attr('placeholder', 'Search')
      .classed('search-radar', true)


    AutoComplete('#auto-complete', quadrants, searchBlip)
  }

  function mouseoverQuadrant (order) {
    d3.select('.quadrant-group-' + order).style('opacity', 1)
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 0.3)
  }

  function mouseoutQuadrant (order) {
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 1)
  }

  function selectQuadrant (order, startAngle) {
    d3.selectAll('.home-link').classed('selected', false)
    createHomeLink(d3.select('header'))

    d3.selectAll('.button').classed('selected', false).classed('full-view', false)
    d3.selectAll('.button.' + order).classed('selected', true)
    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll('.quadrant-table.' + order).classed('selected', true)
    d3.selectAll('.blip-item-description').classed('expanded', false)

    var scale = 2

    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    var adjustY = Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle))

    var translateX = (-1 * (1 + adjustX) * size / 2 * (scale - 1)) + (-adjustX * (1 - scale / 2) * size)
    var translateY = (-1 * (1 - adjustY) * (size / 2 - 7) * (scale - 1)) - ((1 - adjustY) / 2 * (1 - scale / 2) * size)

    var translateXAll = (1 - adjustX) / 2 * size * scale / 2 + ((1 - adjustX) / 2 * (1 - scale / 2) * size)
    var translateYAll = (1 + adjustY) / 2 * size * scale / 2

    var moveRight = (1 + adjustX) * (0.8 * window.innerWidth - size) / 2
    var moveLeft = (1 - adjustX) * (0.8 * window.innerWidth - size) / 2

    var blipScale = 3 / 4
    var blipTranslate = (1 - blipScale) / blipScale

    svg.style('left', moveLeft + 'px').style('right', moveRight + 'px')
    d3.select('.quadrant-group-' + order)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')')
    d3.selectAll('.quadrant-group-' + order + ' .blip-link text').each(function () {
      var x = d3.select(this).attr('x')
      var y = d3.select(this).attr('y')
      d3.select(this.parentNode)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('transform', 'scale(' + blipScale + ')translate(' + blipTranslate * x + ',' + blipTranslate * y + ')')
    })

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto')

    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')')
      .transition()
      .duration(ANIMATION_DURATION)
      .style('pointer-events', 'none')
      .attr('transform', 'translate(' + translateXAll + ',' + translateYAll + ')scale(0)')

    if (d3.select('.legend.legend-' + order).empty()) {
      drawLegend(order)
    }
  }

  self.init = function () {
    radarElement = d3.select('body').append('div').attr('id', 'radar')
    return self
  }

  function constructSheetUrl (sheetName) {
    var noParamUrl = window.location.href.substring(0, window.location.href.indexOf(window.location.search))
    var sheetUrl = noParamUrl + '?sheetName=' + encodeURIComponent(sheetName)
    return sheetUrl
  }

  function plotAlternativeRadars (alternatives, currentSheet) {
    var alternativeSheetButton = alternativeDiv
      .append('div')
      .classed('multiple-sheet-button-group', true)

    alternativeSheetButton.append('p').text('Choose a sheet to populate radar')
    alternatives.forEach(function (alternative) {
      alternativeSheetButton
        .append('div:a')
        .attr('class', 'first full-view alternative multiple-sheet-button')
        .attr('href', constructSheetUrl(alternative))
        .text(alternative)

      if (alternative === currentSheet) {
        d3.selectAll('.alternative').filter(function () {
          return d3.select(this).text() === alternative
        }).attr('class', 'highlight multiple-sheet-button')
      }
    })
  }

  self.plot = function () {
    var rings, quadrants, alternatives, currentSheet

    rings = radar.rings()
    quadrants = radar.quadrants()
    alternatives = radar.getAlternatives()
    currentSheet = radar.getCurrentSheet()
    var header = plotRadarHeader()

    if (alternatives.length) {
      plotAlternativeRadars(alternatives, currentSheet)
    }

    plotQuadrantButtons(quadrants, header)

    radarElement.style('height', size + 14 + 'px')
    svg = radarElement.append('svg').call(tip)
    svg.attr('id', 'radar-plot').attr('width', size).attr('height', size + 14)

    _.each(quadrants, function (quadrant) {
      var quadrantGroup = plotQuadrant(rings, quadrant)
      plotLines(quadrantGroup, quadrant)
      plotTexts(quadrantGroup, rings, quadrant)
      plotBlips(quadrantGroup, rings, quadrant)
    })

    plotRadarFooter()
  }

  return self
}

module.exports = Radar
