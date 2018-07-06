import './index.scss'


export default (function () {
  const slider = document.querySelector('[data-hm-slider]')
  const triggerOne = document.querySelector('[data-hm-slider] [data-trigger="one"]')
  const triggerTwo = document.querySelector('[data-hm-slider] [data-trigger="two"]')
  const indicator = document.querySelector('[data-hm-slider] [data-indicator]')
  // TODO check if elements not null

  // let touchDevice = 'ontouchstart' in document.documentElement
  let isTouchDevice = false;

  let clickCoord = null
  let active = false
  let activeTrigger = null // 'one' || 'two'

  // trigger ONE
  const triggerOneLeftInit = parseInt(window.getComputedStyle(triggerOne).left)
  let triggerOneLeft = triggerOneLeftInit
  const triggerOneWidth = triggerOne.offsetWidth

  // trigger TWO
  const triggerTwoRightInit = parseInt(window.getComputedStyle(triggerTwo).right)
  let triggerTwoRight = triggerTwoRightInit
  const triggerTwoWidth = triggerTwo.offsetWidth

  const sliderWidth = slider.offsetWidth

  const indicatorLeftInit = parseInt(window.getComputedStyle(indicator).left)
  let indicatorLeft = indicatorLeftInit
  const indicatorRightInit = parseInt(window.getComputedStyle(indicator).right)
  let indicatorRight = indicatorRightInit

  const eventStart = (ev, triggerType) => {
    console.log(ev)
    clickCoord = evPageX(ev, isTouchDevice)
    active = true
    activeTrigger = triggerType
  }

  const evPageX = (ev, isTouchDevice) => isTouchDevice ? ev.changedTouches[0].clientX : ev.clientX

  triggerOne.addEventListener('mousedown', function (ev) {
    eventStart(ev, 'one')
  })
  triggerOne.addEventListener('touchstart', function (ev) {
    isTouchDevice = true
    eventStart(ev, 'one')
  })
  triggerTwo.addEventListener('mousedown', function (ev) {
    eventStart(ev, 'two')
  })
  triggerTwo.addEventListener('touchstart', function (ev) {
    isTouchDevice = true
    eventStart(ev, 'two')
  })

  const eventStop = function (ev) {
    // console.log('stop::', ev)
    active = false
    if (activeTrigger === 'one') {
      triggerOneLeft = parseInt(triggerOne.style.left)
    } else if (activeTrigger === 'two') {
      triggerTwoRight = parseInt(triggerTwo.style.right)
    }
  }

  document.addEventListener('mouseup', eventStop)
  document.addEventListener('touchend', eventStop)

  const eventMove = function (ev) {
    // console.log(ev)
    if (active) {
      moveIndicator(ev, activeTrigger)
      moveTrigger(ev, activeTrigger)
    }
  }

  document.addEventListener('mousemove', eventMove)
  document.addEventListener('touchmove', eventMove)

  const getMovedValueFor = function (oneOrTwo) {
    if (oneOrTwo === 'one') {
      return getMovedValueFroOne
    } else if (oneOrTwo === 'two') {
      return getMovedValueFroTwo
    }
  }

  const getMovedValueForOne = function (newVal, triggerOneLeftInit) {
    const maxAllow = triggerOneMaxAllow()

    if (newVal <= maxAllow) {
      if (newVal >= triggerOneLeftInit) {
        return newVal
      } else {
        return triggerOneLeftInit
      }
    } else {
      return maxAllow
    }
  }

  const getMovedValueForTwo = function (newVal, triggerTwoRightInit) {
    const maxAllow = triggerTwoMaxAllow()

    if (newVal <= maxAllow) {
      if (newVal >= triggerOneLeftInit) {
        return newVal
      } else {
        return triggerOneLeftInit
      }
    } else {
      return maxAllow
    }
  }

  const triggerOneMaxAllow = function () {
    return sliderWidth - triggerOneWidth - triggerTwoWidth - triggerTwoRight
  }
  const triggerTwoMaxAllow = function () {
    return sliderWidth - triggerOneWidth - triggerTwoWidth - triggerOneLeft
  }

  const moveTrigger = function (ev, activeTrigger) {
    if (activeTrigger === 'one') {
      const newVal = triggerOneLeft + movedValue(ev, clickCoord, activeTrigger)
      const moveVal = getMovedValueForOne(newVal, triggerOneLeftInit)
      triggerOne.style.left = moveVal + 'px'
    } else if (activeTrigger === 'two') {
      const newVal = triggerTwoRight + movedValue(ev, clickCoord, activeTrigger)
      const moveVal = getMovedValueForTwo(newVal, triggerOneLeftInit)
      triggerTwo.style.right = moveVal + 'px'
    }
  }

  const movedValue = (ev, clickCoord, trigg) => {
    if (trigg === 'one') {
      return evPageX(ev, isTouchDevice) - clickCoord
    } else if (trigg === 'two') {
      return clickCoord - evPageX(ev, isTouchDevice)
    }
  }

  const getMovedValueForIndicatorLeft = function (newVal, indicatorLeftInit) {
    const maxAllow = triggerOneMaxAllow() + triggerOneWidth
    if (newVal >= indicatorLeftInit) {
      if (newVal <= maxAllow) {
        return newVal
      } else {
        return maxAllow
      }
    } else {
      return indicatorLeftInit
    }
  }

  const getMovedValueForIndicatorRight = function (newVal, indicatorRightInit) {
    const maxAllow = triggerTwoMaxAllow() + triggerTwoWidth
    if (newVal >= indicatorRightInit) {
      if (newVal <= maxAllow) {
        return newVal
      } else {
        return maxAllow
      }
    } else {
      return indicatorRightInit
    }
  }

  const moveIndicator = function (ev, activeTrigger) {
    if (activeTrigger === 'one') {

      const newVal = triggerOneLeft + movedValue(ev, clickCoord, activeTrigger) + triggerOneWidth
      const moveVal = getMovedValueForIndicatorLeft(newVal, indicatorLeftInit)
      indicator.style.left = moveVal + 'px'
      indicatorLeft = moveVal
    } else if (activeTrigger === 'two') {

      const newVal = triggerTwoRight + movedValue(ev, clickCoord, activeTrigger) + triggerTwoWidth
      const moveVal = getMovedValueForIndicatorRight(newVal, indicatorRightInit)
      indicator.style.right = moveVal + 'px'
      indicatorRight = moveVal
    }
  }

})()