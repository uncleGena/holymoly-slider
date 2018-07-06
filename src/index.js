import './index.scss'


export default (function () {
  const slider = document.querySelector('[data-hm-slider]')
  const triggerOne = document.querySelector('[data-hm-slider] [data-trigger="one"]')
  const triggerTwo = document.querySelector('[data-hm-slider] [data-trigger="two"]')
  const indicator = document.querySelector('[data-hm-slider] [data-indicator]')

  // TODO check if elements not null

  let clickCoord = null
  let active = false
  // let activeTrigger = null // 'one' || 'two'

  // trigger ONE
  const triggerOneLeftInit = parseInt(window.getComputedStyle(triggerOne).left)
  let triggerOneLeft = triggerOneLeftInit
  const triggerOneWidth = triggerOne.offsetWidth

  // trigger TWO
  const triggerTwoRightInit = parseInt(window.getComputedStyle(triggerTwo).right)
  let triggerTwoRight = triggerTwoRightInit
  const triggerTwoWidth = triggerTwo.offsetWidth

  const sliderWidth = slider.offsetWidth

  let indicatorLeftInit = parseInt(window.getComputedStyle(indicator).left)
  let indicatorRightInit = parseInt(window.getComputedStyle(indicator).right)

  triggerOne.addEventListener('mousedown', function (ev) {
    clickCoord = ev.pageX
    active = true
    // activeTrigger = 'one'
  })
  // triggerTwo.addEventListener('mousedown', function (ev) {
  //   clickCoord = ev.pageX
  //   active = true
  //   activeTrigger = 'two'
  // })

  document.addEventListener('mouseup', function (ev) {
    active = false
    triggerOneLeft = parseInt(triggerOne.style.left)
  })

  document.addEventListener('mousemove', function (ev) {
    if (active) {
      moveIndicator(ev)
      moveTrigger(ev)
    }
  })

  const getMovedValue = function (newVal, triggerOneLeftInit, indicatorRightInit) {
    const maxAllow = triggerOneMaxAllow()

    // if (newVal <= maxAllow && newVal >= triggerOneLeftInit) return newVal
    // if (newVal <= maxAllow && newVal < triggerOneLeftInit) return triggerOneLeftInit
    // if (newVal > maxAllow) return maxAllow

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
    return sliderWidth - indicatorRightInit - triggerOneWidth
  }

  const moveTrigger = function (ev) {
    const newVal = triggerOneLeft + (ev.pageX - clickCoord)
    const moveVal = getMovedValue(newVal, triggerOneLeftInit, indicatorRightInit)
    triggerOne.style.left = moveVal + 'px'
  }

  const moveIndicator = function (ev) {
    const newVal = triggerOneLeft + (ev.pageX - clickCoord) + triggerOneWidth
    const moveVal = newVal >= indicatorLeftInit ? newVal : indicatorLeftInit
    indicator.style.left = moveVal + 'px'
  }

})()