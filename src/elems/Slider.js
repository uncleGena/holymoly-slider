import Trigger from './Trigger'
import IndicatorSide from './IndicatorSide';

export default class Slider {
  constructor({
    selector,
    onInit,
    onActive,
    onChange,
    onDisactive
  } = {}) {
    this.sliderElem = document.querySelector(selector)
    // TODO check if elements not null

    this.onChange = onChange
    this.onInit = onInit
    this.onActive = onActive
    this.onDisactive = onDisactive

    this.sliderWidth = this.sliderElem.offsetWidth

    // this.isTouchDevice = false

    // left trigger (левый ползунок)
    this.triggerLeft = new Trigger({
      name: 'left',
      selector: selector,
      sliderWidth: this.sliderWidth,
      onChange: ({
        ev,
        name,
        isTouch,
        width,
        value
      }) => {
        this.triggerRight.anotherTriggerWidth = width
        this.triggerRight.anotherTriggerValue = value
        this.indicatorSideLeft.setValue(value + width)
      }
    })

    // right trigger (правый ползунок)
    this.triggerRight = new Trigger({
      name: 'right',
      selector: selector,
      sliderWidth: this.sliderWidth,
      onChange: ({
        ev,
        name,
        isTouch,
        width,
        value
      }) => {
        this.triggerLeft.anotherTriggerWidth = width
        this.triggerLeft.anotherTriggerValue = value
        this.indicatorSideRight.setValue(value + width)
      }
    })

    // seft side of middle indicator
    this.indicatorSideLeft = new IndicatorSide({
      selector,
      side: 'left'
    })

    // right side of middle indicator
    this.indicatorSideRight = new IndicatorSide({
      selector,
      side: 'right'
    })
  }
}