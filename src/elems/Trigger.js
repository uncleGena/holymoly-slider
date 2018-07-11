export default class Trigger {
  constructor({
    dataName = 'hmSliderMin',
    dataValue,
    cssName,
    opositeCssName,
    element,
    sliderWidth,
    minMaxDiapazon,
    onStart = () => {},
    onChange = () => {},
    step = null,
    formatNumber = false,
    sign = false
  }) {
    this.dataName = dataName
    this.dataValue = dataValue
    this.cssName = cssName
    this.opositeCssName = opositeCssName
    this.triggerElem = element
    this.sliderWidth = sliderWidth
    this.minMaxDiapazon = minMaxDiapazon
    this.onStart = onStart
    this.onChange = onChange
    this.step = step ? step : minMaxDiapazon
    this.formatNumber = formatNumber
    this.sign = sign

    this.triggerMinInit = parseInt(window.getComputedStyle(this.triggerElem)[cssName])
    this.triggerMin = this.triggerMinInit
    this.triggerElemWidth = this.triggerElem.offsetWidth

    this.highlighted = this.triggerElem.classList.contains('trigger-active') // through get/set
    this.isTouchDevice = false
    this.clickCoord = null
    this.moveValOld = null
    this.cutSign = this.triggerElem.dataset['hmSliderCutSign'] || false

    this.currentPixelVal = this.triggerMinInit
    this.currentVisualVal = dataValue

    this.anotherTriggerWidth = null
    this.anotherTriggerValue = null

    // this.onStart(this.triggerElemWidth, this.triggerMin)
    this.onStart({
      data: {
        cssName: this.cssName,
        opositeCssName: this.opositeCssName,
        value: dataValue
      },
      ui: {
        width: this.triggerElemWidth,
        value: this.triggerMin
      }
    })

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

    const val = this.formatNumber ? this.valueFormated(this.dataValue) : this.dataValue.toFixed(0)
    this.updateVisualValue(val + this.cutSignAddition(this.sign, this.cutSign, val, val))
  }

  // T - means tested
  // P - means pending

  get sliderWidth() {
    return this.$sliderWidth
  }

  set sliderWidth(val) {
    this.$sliderWidth = val
    if (val * .7 < this.currentPixelVal) {
      this.applyTriggerPosition(val - this.triggerElemWidth - this.anotherTriggerWidth)
      console.warn('Trigger moved outside of slider')
    }
  }

  get active() {
    return this.$active
  }

  set active(val) {
    this.$active = val
    this.toggleHighlightClass(this.active, this.isMoved())
  }

  isMoved() { // T
    return this.currentPixelVal !== this.triggerMinInit
  }

  addHighlightedClass() { // T
    this.highlighted = true
    this.triggerElem.classList.add('trigger-highlighted')
  }

  removeHighlightedClass() { // T
    this.highlighted = false
    this.triggerElem.classList.remove('trigger-highlighted')
  }

  toggleHighlightClass(active, isMoved) { // T
    active || isMoved ? this.addHighlightedClass() : this.removeHighlightedClass()
  }

  eventStart(ev) { // T
    this.clickCoord = this.evPageX(ev, this.isTouchDevice)
    this.active = true
  }

  eventStop(ev) { // T
    this.active = false
    const param = this.triggerElem.style[this.cssName]
    this.triggerMin = parseInt(param === '' ? 0 : param)
  }

  eventMove(ev) { // T
    if (this.active) {
      this.moveTrigger(ev)
    }
  }

  evPageX(ev, isTouchDevice) { // T
    return isTouchDevice ? ev.changedTouches[0].clientX : ev.clientX
  }

  movedCursorValue(ev, clickCoord) { // T
    // console.warn(this.evPageX(ev, this.isTouchDevice))
    if (this.cssName === 'left') {
      return this.evPageX(ev, this.isTouchDevice) - clickCoord
    } else if (this.cssName === 'right') {
      return clickCoord - this.evPageX(ev, this.isTouchDevice)
    }
  }

  getExactMovedValue(min, val, max) { // T
    if (val <= max) {
      if (val >= min) {
        return val
      } else {
        return min
      }
    } else {
      return max
    }
  }

  getCurrentStep(currVal, step, fullIndicatorWidth) { // T
    const stepVal = fullIndicatorWidth / step
    const currentStep = parseInt((currVal / stepVal).toFixed(0))
    return currentStep
  }

  getMagneticMovedValue(val, step, fullIndicatorWidth) { // T
    const stepVal = fullIndicatorWidth / step
    const currentStep = parseInt((val / stepVal).toFixed(0))
    return currentStep * stepVal
  }

  getMinMaxCurrentStep(minMaxDiapazon, totalSteps, currStep, valuePerStep) { // T
    if (this.dataName === 'hmSliderMin') {
      const val = (totalSteps - currStep) * valuePerStep
      const currStepVal = minMaxDiapazon - val + this.dataValue
      return currStepVal
    } else if (this.dataName === 'hmSliderMax') {
      const val = currStep * valuePerStep
      const currStepVal = minMaxDiapazon - val + (this.dataValue - minMaxDiapazon)
      return currStepVal
    }
  }

  getVisualValue(minMaxDiapazon, totalSteps, currStep) { // T
    const valuePerStep = minMaxDiapazon / parseInt(totalSteps)
    const currentValue = this.getMinMaxCurrentStep(minMaxDiapazon, totalSteps, currStep, valuePerStep)
    return currentValue
  }

  updateVisualValue(visualValue) { // T
    this.triggerElem.innerHTML = visualValue
  }

  triggerElemMaxAllow() { // T
    return this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth - this.anotherTriggerValue
  }

  cutSignAddition(sign, cutSign, curVal, initVal = null) { // T
    if (!sign) {
      return cutSign && curVal === initVal ? cutSign : ''
    } else return sign
  }

  valueFormated(curVal) { // T
    if (curVal > 9999999) {
      return (curVal / 1000000).toFixed(0) + 'm'
    }
    if (curVal > 999999) {
      return (curVal / 1000000).toFixed(1) + 'm'
    }
    if (curVal > 99999) {
      return (curVal / 1000).toFixed(0) + 'k'
    }
    if (curVal > 9999) {
      return (curVal / 1000).toFixed(0) + 'k'
    }
    if (curVal > 999) {
      return parseFloat((curVal / 1000).toFixed(1)) + 'k'
    }
    if (curVal > 99) {
      return curVal.toFixed(0)
    }
    if (curVal >= 10) {
      return curVal.toFixed(0)
    }
    if (curVal >= 1) {
      return curVal.toFixed(1)
    }
    if (curVal > 0) {
      return curVal.toFixed(2)
    }
    if (curVal === 0) {
      return curVal.toFixed(0)
    } else return curVal
  }

  moveTrigger(ev) {
    const newVal = this.triggerMin + this.movedCursorValue(ev, this.clickCoord)
    // console.warn(newVal)
    const maxAllow = this.triggerElemMaxAllow()
    // console.log(maxAllow)
    const moveVal = this.getExactMovedValue(this.triggerMinInit, newVal, maxAllow)
    const fullIndicatorWidth = this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth
    const currentStep = this.getCurrentStep(moveVal, this.step, fullIndicatorWidth)
    this.currentStep = currentStep

    const magneticVal = this.getMagneticMovedValue(moveVal, this.step, fullIndicatorWidth)
    this.currentPixelVal = magneticVal

    const visualValue = this.getVisualValue(this.minMaxDiapazon, this.step, currentStep)
    this.currentVisualVal = visualValue

    const formatedValue = this.formatNumber ? this.valueFormated(visualValue) : visualValue.toFixed(0)
    const cuttedSign = this.cutSignAddition(this.sign, this.cutSign, visualValue, this.dataValue)
    const vusualValWithCutSign = formatedValue + cuttedSign

    // если зничение реально изменилось
    if (this.moveValOld !== magneticVal) {

      this.onChange({
        ev,
        data: {
          cssName: this.cssName,
          opositeCssName: this.opositeCssName,
          value: visualValue
        },
        ui: {
          width: this.triggerElemWidth,
          value: magneticVal
        }
      })

      this.updateVisualValue(vusualValWithCutSign)
      this.moveValOld = magneticVal
    }

    this.applyTriggerPosition(magneticVal)
  }

  applyTriggerPosition(val) { // T
    this.triggerElem.style[this.cssName] = val + 'px'
  }

}