import Trigger from './Trigger'
import IndicatorSide from './IndicatorSide';

export default class Slider {
  constructor({
    selector,
    formatNumber = false,
    onInit,
    onActive,
    onChange,
    onDisactive
  } = {}) {
    this.selector = selector
    this.formatNumber = formatNumber
    this.onChange = onChange
    this.onInit = onInit
    this.onActive = onActive
    this.onDisactive = onDisactive

    this.sliderMinName = 'hmSliderMin'
    this.sliderMaxName = 'hmSliderMax'
    this.sliderStepName = 'hmSliderStep'

    if (typeof selector === 'string') {
      this.sliderElem = document.querySelector(selector)
    } else if (selector instanceof HTMLElement) {
      this.sliderElem = selector
    } else {
      console.warn('Selector of slider should be string or HTMLElement')
    }

    this.sliderWidth = this.sliderElem.offsetWidth
    this.dataSet = this.sliderElem.dataset
    this.minMaxDiapazon = this.dataSet[this.sliderMaxName] - this.dataSet[this.sliderMinName]

    // left trigger (левый ползунок)
    this.triggerLeft = new Trigger(this.triggerProps(
      this.sliderMinName, 
      'left', 
      'triggerRight', 
      'indicatorSideLeft'
    ))

    // right trigger (правый ползунок)
    this.triggerRight = new Trigger(this.triggerProps(
      this.sliderMaxName,
      'right',
      'triggerLeft',
      'indicatorSideRight',
    ))

    // seft side of middle indicator
    this.indicatorSideLeft = new IndicatorSide({
      baseElement: this.sliderElem,
      side: 'left'
    })

    // right side of middle indicator
    this.indicatorSideRight = new IndicatorSide({
      baseElement: this.sliderElem,
      side: 'right'
    })
  }

  triggerProps(dataValueName, direction, triggerInstName, indicatorInstName) {
    return {
      dataName: dataValueName,
      dataValue: parseInt(this.dataSet[dataValueName]),
      minMaxDiapazon: this.minMaxDiapazon,
      name: direction,
      element: this.sliderElem.querySelector(`[data-trigger="${direction}"]`),
      sliderWidth: this.sliderWidth,
      step: parseInt(this.dataSet[this.sliderStepName]),
      formatNumber: this.formatNumber,
      sign: this.dataSet['hmSliderSign'] || false,
      onStart: (width, value) => {

        // push to task queue in order to wait until another trigger instance creates
        setTimeout(() => {
          this[triggerInstName].anotherTriggerWidth = width
          this[triggerInstName].anotherTriggerValue = value
        })
      },
      onChange: ({
        ev,
        name,
        isTouch,
        width,
        value
      }) => {
        this[triggerInstName].anotherTriggerWidth = width
        this[triggerInstName].anotherTriggerValue = value
        this[indicatorInstName].setValue(value + width)
      }
    }
  }
}