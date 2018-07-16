import Common from '../common/Common'

export default class IndicatorSide {
  constructor({
    baseElement,
    side,
  }) {
    this.indicator = baseElement.querySelector(`[data-indicator]`)
    this.side = side
    this.valueInit = parseInt(window.getComputedStyle(this.indicator)[side])
    this.valueCurr = this.valueInit
  }

  get valueCurr() {
    return this.$valueCurr
  }

  set valueCurr(val) {
    this.$valueCurr = val
    this.indicator.style[this.side] = val + 'px'
  }

  get isAnimating() {
    return this.$isAnimating
  }
  set isAnimating(val) {
    Common.toggleTransition(this.indicator, val)
    this.$isAnimating = val
  }

}