export default class Trigger {
  constructor({
    name,
    selector,
    sliderWidth,
    onChange
  }) {
    this.name = name
    this.triggerElem = document.querySelector(`${selector} [data-trigger="${name}"]`)
    this.onChange = onChange

    this.triggerMinInit = parseInt(window.getComputedStyle(this.triggerElem)[name])
    this.triggerMin = this.triggerMinInit
    this.triggerElemWidth = this.triggerElem.offsetWidth

    this.active = false
    this.isTouchDevice = false
    this.clickCoord = null
    this.sliderWidth = sliderWidth

    this.anotherTriggerWidth = null
    this.anotherTriggerValue = null

    // EVENTS
    this.triggerElem.addEventListener('mousedown', ev => {
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
      // this.onChange(ev, this.name)
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

  triggerElemMaxAllow() {
    return this.sliderWidth - this.triggerElemWidth - this.anotherTriggerWidth - this.anotherTriggerValue
  }

  moveTrigger(ev, activeTrigger) {
    const newVal = this.triggerMin + this.movedValue(ev, this.clickCoord, activeTrigger)
    const maxAllow = this.triggerElemMaxAllow()
    const moveVal = this.getExactMovedValue(newVal, this.triggerMinInit, maxAllow)

    // если зничение реально изменилось
    if (this.moveValOld !== moveVal) {
      this.onChange({
        ev,
        name: this.name,
        isTouch: this.isTouchDevice,
        width: this.triggerElemWidth,
        value: moveVal
      })

      this.moveValOld = moveVal
    }

    this.triggerElem.style[this.name] = moveVal + 'px'
  }

}