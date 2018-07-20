import Common from '../common/Common'

export default class Trigger {
  constructor({
    dataName = 'hmSliderMin',
    dataValue,
    cssName,
    opositeCssName,
    element,
    sliderWidth,
    minMaxDiapazon,
    notify = () => {},
    onStart = () => {},
    onChangeStart = () => {},
    onChange = () => {},
    onChangeEnd = () => {},
    updateIndicator = () => {},
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
    this.nofity = notify
    this.onStart = onStart
    this.onChangeStart = onChangeStart
    this.onChange = onChange
    this.onChangeEnd = onChangeEnd
    this.valuePerStep = step
    this.step = step ? (minMaxDiapazon / step) : minMaxDiapazon // quantity of steps
    this.updateIndicator = updateIndicator
    this.formatNumber = formatNumber
    this.sign = sign

    this.triggerMinInit = parseInt(window.getComputedStyle(this.triggerElem)[cssName])
    this.triggerMin = this.triggerMinInit
    this.triggerElemWidth = parseInt(window.getComputedStyle(this.triggerElem)['width'])

    this.highlighted = this.triggerElem.classList.contains('trigger-active') // through get/set
    this.isTouchDevice = false
    this.clickCoord = null
    this.moveValOld = null
    this.triggerDataset = this.triggerElem.dataset
    this.cutSign = this.triggerElem.dataset['hmSliderCutSign'] || false
    this.inMoveState = false
    this.isAnimating = false

    this.currentPixelVal = this.triggerMinInit
    this.currentVisualVal = dataValue

    this.anotherTriggerWidth = null
    this.anotherTriggerPxValue = null
    // this.anotherTriggerVisualVal = null
    // this.anotherTriggerVisualValInit = null

    this.nofity(this.dataToReturn())
    this.onStart(this.dataToReturn())

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

    const vusualValWithCutSign = this.getVisualValueWithCutSign()
    this.updateVisualValue(vusualValWithCutSign)
  }

  // T - means tested
  // P - means pending

  get isAnimating() {
    return this.$isAnimating
  }
  set isAnimating(val) {
    Common.toggleTransition(this.triggerElem, val)
    this.$isAnimating = val
  }

  get sliderWidth() {
    return this.$sliderWidth
  }
  set sliderWidth(val) {
    // const oldWidth = this.$sliderWidth
    // const newWidth = val
    // const widthCoefChanged = newWidth / oldWidth

    // const oldPixVal = this.currentPixelVal
    // const newPixVal = oldPixVal * widthCoefChanged

    // this.currentPixelVal = newPixVal


    // console.warn('FFFFFFFF')
    // this.applyTriggerPosition(newPixVal)
    this.$sliderWidth = val
    if (val < this.currentPixelVal) {
      // this.applyTriggerPosition(val - this.triggerElemWidth - this.anotherTriggerWidth)
      // console.warn('Trigger moved outside of slider')
    }
  }

  get active() {
    return this.$active
  }
  set active(val) {
    this.$active = val
    this.toggleHighlightClass(this.active, this.isMoved())
  }

  get currentPixelVal() {
    return this.$currentPixelVal
  }
  set currentPixelVal(val) {
    this.$currentPixelVal = val
    this.applyTriggerPosition(val)
  }

  get inMoveState() {
    return this.$inMoveState
  }
  set inMoveState(val) {
    if (val && this.$inMoveState !== val) {
      this.onChangeStart(this.dataToReturn())
    } else if (!val && this.$inMoveState !== val && this.$inMoveState !== undefined) {
      this.onChangeEnd(this.dataToReturn())
    }
    this.$inMoveState = val
  }

  setNewValue(val) {
    const pxRange = this.minMaxPxRange()
    const valRange = this.minMaxDiapazon
    const pxPerVal = pxRange / valRange

    const valueGain = Math.abs(this.currentVisualVal - val)
    const pxGain = valueGain * pxPerVal

    
    this.updateCurrentState(pxGain)
    this.updateVisualValue(this.getVisualValueWithCutSign())
    this.updateIndicator(this.dataToReturn())
    this.applyTriggerPosition(this.currentPixelVal)
    this.eventStop()
    
    const data = this.dataToReturn()
    console.log(this.currentVisualVal, data)
    this.nofity(data)
  }

  updatePosition() {
    console.log(this.currentVisualVal)
    this.setNewValue(this.currentVisualVal)
  }

  updateCurrentState(newVal) { // T
    const maxAllow = this.triggerElemMaxAllow()
    const moveVal = this.getExactMovedValue(this.triggerMinInit, newVal, maxAllow)
    const fullIndicatorWidth = this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth
    const currentStep = this.getCurrentStep(moveVal, this.step, fullIndicatorWidth)

    this.currentPixelVal = this.getMagneticMovedValue(moveVal, this.step, fullIndicatorWidth)
    this.currentVisualVal = this.getVisualValue(this.minMaxDiapazon, this.step, currentStep)
  }

  resetToInitial() { // P
    this.updateCurrentState(0)

    this.updateVisualValue(this.getVisualValueWithCutSign())

    this.updateIndicator(this.dataToReturn())

    this.eventStop()

    // TODO: create animation for triggers
    return new Promise(resolve => {
      // setTimeout(() => {
      resolve(this.dataToReturn())
      // }, 500)
    })

  }

  isMoved() { // T
    return this.currentPixelVal !== this.triggerMinInit
  }

  addHighlightedClass() { // T
    this.highlighted = true
    this.triggerElem.classList.add('hm-slider--trigger-highlighted')
  }

  removeHighlightedClass() { // T
    this.highlighted = false
    this.triggerElem.classList.remove('hm-slider--trigger-highlighted')
  }

  toggleHighlightClass(active, isMoved) { // T
    active || isMoved ? this.addHighlightedClass() : this.removeHighlightedClass()
  }

  eventStart(ev) { // T
    this.clickCoord = this.evPageX(ev, this.isTouchDevice)
    this.active = true
  }

  eventStop() { // T
    this.active = false
    const param = this.triggerElem.style[this.cssName]
    this.triggerMin = parseInt(param === '' ? 0 : param)
    this.inMoveState = false
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
    const currentStep = (val / stepVal).toFixed(0)
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

  minMaxPxRange() {
    return this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth
  }

  triggerElemMaxAllow() { // T
    return this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth - this.anotherTriggerPxValue
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
      return parseFloat(curVal.toFixed(1)) + ''
    }
    if (curVal > 0) {
      return parseFloat(curVal.toFixed(2)) + ''
    }
    if (curVal === 0) {
      return curVal.toFixed(0)
    } else return curVal
  }

  formatValueWithTen() { // P
    // if (this.formatNumber && this.valuePerStep === 1) {
    //   return parseFloat(this.currentVisualVal.toFixed(2))
    // } 

    if (this.formatNumber) {
      return this.valueFormated(this.currentVisualVal)
    } else {
      return parseFloat(this.currentVisualVal.toFixed(2))
    }
  }

  getVisualValueWithCutSign() { // T
    const formatedValue = this.formatValueWithTen()
    const cuttedSign = this.cutSignAddition(this.sign, this.cutSign, this.currentVisualVal, this.dataValue)
    const visualValWithCutSign = formatedValue + cuttedSign
    return visualValWithCutSign
  }

  dataToReturn() { // T
    return {
      data: {
        cssName: this.cssName,
        opositeCssName: this.opositeCssName,
        value: this.currentVisualVal
      },
      ui: {
        width: this.triggerElemWidth,
        value: this.currentPixelVal
      }
    }
  }

  moveTrigger(ev) {
    const newVal = this.triggerMin + this.movedCursorValue(ev, this.clickCoord)
    console.log(newVal)
    this.updateCurrentState(newVal)

    // если зничение реально изменилось
    if (this.moveValOld !== this.currentPixelVal) {
      this.inMoveState = true

      this.updateIndicator(this.dataToReturn())

      const data = this.dataToReturn()
      data.ev = ev
      this.nofity(data)
      this.onChange(data)

      this.updateVisualValue(this.getVisualValueWithCutSign())
      this.moveValOld = this.currentPixelVal
      this.applyTriggerPosition(this.currentPixelVal)
    }

  }

  applyTriggerPosition(val) { // T
    // const percVal = this.pxToPercent(this.sliderWidth, val)
    // console.warn(percVal)
    this.triggerElem.style[this.cssName] = val + 'px'
  }

}