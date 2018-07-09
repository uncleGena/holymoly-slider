export default class Trigger {
  constructor({
    dataName,
    dataValue = 0,
    name,
    selector,
    sliderWidth,
    minMaxDiapazon,
    onStart = () => {},
    onChange = () => {},
    step = null
  }) {
    this.dataName = dataName
    this.dataValue = dataValue
    this.name = name
    this.triggerElem = document.querySelector(`${selector} [data-trigger="${name}"]`)
    this.onStart = onStart
    this.onChange = onChange
    this.step = step
    this.minMaxDiapazon = minMaxDiapazon

    this.triggerMinInit = parseInt(window.getComputedStyle(this.triggerElem)[name])
    this.triggerMin = this.triggerMinInit
    this.triggerElemWidth = this.triggerElem.offsetWidth

    this.active = false
    this.isTouchDevice = false
    this.clickCoord = null
    this.sliderWidth = sliderWidth

    this.anotherTriggerWidth = null
    this.anotherTriggerValue = null

    this.onStart(this.triggerElemWidth, this.triggerMin)

    // EVENTS
    this.triggerElem.addEventListener('mousedown', ev => {
      this.isTouchDevice = false
      this.eventStart(ev)
    })
    this.triggerElem.addEventListener('touchstart', ev => {
      this.isTouchDevice = true
      this.eventStart(ev)
    })
    document.addEventListener('mouseup', this.eventStop.bind(this))
    document.addEventListener('touchend', this.eventStop.bind(this))
    document.addEventListener('mousemove', this.eventMove.bind(this))
    document.addEventListener('touchmove', this.eventMove.bind(this))

    this.updateVusualValue(dataValue)
  }

  // tested
  eventStart(ev) {
    this.clickCoord = this.evPageX(ev, this.isTouchDevice)
    this.active = true
  }

  eventStop(ev) {
    this.active = false
    const param = this.triggerElem.style[this.name]
    this.triggerMin = parseInt(param === '' ? 0 : param)
  }

  eventMove(ev) {
    if (this.active) {
      this.moveTrigger(ev, this.activeTrigger)
    }
  }

  // tested
  evPageX(ev, isTouchDevice) {
    return isTouchDevice ? ev.changedTouches[0].clientX : ev.clientX
  }

  movedValue(ev, clickCoord, trigg) {
    if (this.name === 'left') {
      return this.evPageX(ev, this.isTouchDevice) - clickCoord
    } else if (this.name === 'right') {
      return clickCoord - this.evPageX(ev, this.isTouchDevice)
    }
  }

  getExactMovedValue(newVal, triggerMinInit, maxAllow) {
    if (newVal <= maxAllow) {
      if (newVal >= triggerMinInit) {
        return newVal
      } else {
        return triggerMinInit
      }
    } else {
      return maxAllow
    }
  }

  getCurrentStep(currVal, step, fullIndicatorWidth) {
    const stepVal = fullIndicatorWidth / step
    const currentStep = (currVal / stepVal).toFixed(0)
    return currentStep
  }

  getMagneticMovedValue(val, step, fullIndicatorWidth) {
    const stepVal = fullIndicatorWidth / step
    const currentStep = (val / stepVal).toFixed(0)
    return currentStep * stepVal
  }

  getMinMaxCurrentStep(minMaxDiapazon, totalSteps, currStep, valuePerStep) {
    if (this.dataName === 'hmSliderMin') {
      const val = (totalSteps - currStep) * valuePerStep
      return minMaxDiapazon - val + this.dataValue
    } else if (this.dataName === 'hmSliderMax') {
      // const leftValue = 700
      const val = currStep * valuePerStep
      return minMaxDiapazon - val + (this.dataValue - minMaxDiapazon)
    }
  }

  getVisualValue(minMaxDiapazon, totalSteps, currStep) {
    const valuePerStep = minMaxDiapazon / parseInt(totalSteps)
    const currentValue = this.getMinMaxCurrentStep(minMaxDiapazon, totalSteps, currStep, valuePerStep)
    return currentValue
  }

  updateVusualValue(visualValue) {
    this.triggerElem.innerHTML = visualValue.toFixed(0)
  }

  triggerElemMaxAllow() {
    return this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth - this.anotherTriggerValue
  }

  moveTrigger(ev, activeTrigger) {
    const newVal = this.triggerMin + this.movedValue(ev, this.clickCoord, activeTrigger)
    const maxAllow = this.triggerElemMaxAllow()
    const moveVal = this.getExactMovedValue(newVal, this.triggerMinInit, maxAllow)
    const fullIndicatorWidth = this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth
    const currentStep = this.getCurrentStep(moveVal, this.step, fullIndicatorWidth)
    const magneticVal = this.getMagneticMovedValue(moveVal, this.step, fullIndicatorWidth)
    const visualValue = this.getVisualValue(this.minMaxDiapazon, this.step, currentStep)

    // если зничение реально изменилось
    if (this.moveValOld !== magneticVal) {
      this.onChange({
        ev,
        name: this.name,
        isTouch: this.isTouchDevice,
        width: this.triggerElemWidth,
        value: magneticVal
      })
      this.updateVusualValue(visualValue)
      this.moveValOld = magneticVal
    }

    this.triggerElem.style[this.name] = magneticVal + 'px'
  }

}