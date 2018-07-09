export default class IndicatorSide {
  constructor({
    selector,
    side,
  }) {
    this.indicator = document.querySelector(`${selector} [data-indicator]`)
    this.side = side
    this.valueInit = parseInt(window.getComputedStyle(this.indicator)[side])
    this.valueCurr = this.valueInit
  }

  setValue(val) {
    this.indicator.style[this.side] = val + 'px'
  }
}