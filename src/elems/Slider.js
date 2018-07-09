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
    this.selector = selector
    this.onChange = onChange
    this.onInit = onInit
    this.onActive = onActive
    this.onDisactive = onDisactive
    
    this.sliderMinName = 'hmSliderMin'
    this.sliderMaxName = 'hmSliderMax'
    this.sliderStepName = 'hmSliderStep'
    
    this.sliderElem = document.querySelector(selector)
    // TODO check if elements not null
    
    this.sliderWidth = this.sliderElem.offsetWidth
    this.dataSet = this.sliderElem.dataset
    this.minMaxDiapazon = this.dataSet[this.sliderMaxName] - this.dataSet[this.sliderMinName]

    // left trigger (левый ползунок)
    this.triggerLeft = new Trigger(this.triggerProps(this.sliderMinName, 'left', 'triggerRight', 'indicatorSideLeft'))

    // right trigger (правый ползунок)
    this.triggerRight = new Trigger(this.triggerProps(this.sliderMaxName, 'right', 'triggerLeft', 'indicatorSideRight'))

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

  triggerProps(dataValueName, direction, triggerInstName, indicatorInstName) {
    return {
      dataName: dataValueName,
      dataValue: parseInt(this.dataSet[dataValueName]),
      minMaxDiapazon: this.minMaxDiapazon,
      name: direction,
      selector: this.selector,
      sliderWidth: this.sliderWidth,
      step: this.dataSet[this.sliderStepName],
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
        // console.log('changed::', name, value)
        this[triggerInstName].anotherTriggerWidth = width
        this[triggerInstName].anotherTriggerValue = value
        this[indicatorInstName].setValue(value + width)
      }
    }
  }
}