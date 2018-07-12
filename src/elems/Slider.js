import Trigger from './Trigger'
import IndicatorSide from './IndicatorSide';

export default class Slider {
  constructor({
    selector,
    formatNumber = true,
    onInit = () => {},
    onChangeStart = () => {},
    onChange = () => {},
    onChangeEnd = () => {}
  } = {}) {
    this.selector = selector
    this.formatNumber = formatNumber
    this.onInit = onInit
    this.onChangeStart = onChangeStart
    this.onChange = onChange
    this.onChangeEnd = onChangeEnd

    this.triggersConfig = [{
        cssName: 'left',
        opositeCssName: 'right',
        dataName: 'hmSliderMin'
      },
      {
        cssName: 'right',
        opositeCssName: 'left',
        dataName: 'hmSliderMax'
      }
    ]

    this.sliderStepName = 'hmSliderStep'

    if (typeof selector === 'string') {
      this.sliderElem = document.querySelector(selector)
    } else if (selector instanceof HTMLElement) {
      this.sliderElem = selector
    } else {
      console.warn('Selector of slider should be string or HTMLElement')
    }

    this.dataSet = this.sliderElem.dataset
    this.minMaxDiapazon = this.dataSet[this.triggersConfig[1].dataName] - this.dataSet[this.triggersConfig[0].dataName]
    this.step = parseInt(this.dataSet[this.sliderStepName])

    this.triggers = this.triggersConfig.map(o => {
      return new Trigger(this.triggerPropsConfig(o))
    })

    this.indicatorSides = this.triggersConfig.map(o => {
      return new IndicatorSide({
        baseElement: this.sliderElem,
        side: o.cssName
      })
    })

    this.sliderWidth = this.sliderElem.offsetWidth

    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        this.sliderWidth = this.sliderElem.offsetWidth
      }, 50)
    }, false);

    this.onInit()
  }

  triggerPropsConfig(params) {

    const {
      cssName,
      opositeCssName,
      dataName
    } = params

    return {
      dataName: dataName,
      dataValue: parseInt(this.dataSet[dataName]),
      minMaxDiapazon: this.minMaxDiapazon,
      cssName,
      opositeCssName,
      element: this.sliderElem.querySelector(`[data-trigger="${cssName}"]`),
      sliderWidth: this.sliderWidth,
      step: this.step,
      formatNumber: this.formatNumber,
      sign: this.dataSet['hmSliderSign'] || false,
      onStart: (props) => {
        setTimeout(() => {
          this.changeOppositeTriggerWidth(props.data, props.ui)
        })
      },
      onChangeStart: props => {
        this.onChangeStart && this.onChangeStart(this.returnDataSetup(props))
      },
      onChange: props => {
        this.changeOppositeTriggerWidth(props.data, props.ui)
        this.onChange && this.onChange(this.returnDataSetup(props))
      },
      onChangeEnd: props => {
        this.onChangeEnd && this.onChangeEnd(this.returnDataSetup(props))
      },
      updateIndicator: (props) => {
        this.changeIndicatorSideValue(props.data, props.ui)
      }
    }
  }

  getActiveTriggerInd(name) {
    return this.triggers.reduce((acc, el, ind) => {
      if (el.cssName === name) acc = ind;
      return acc
    }, -1)
  }

  returnDataSetup(params = false) {
    const data = {
      slider: {
        dataSet: this.dataSet,
        elem: this.sliderElem
      },
      triggers: this.triggers.map(tr => {
        return {
          elem: tr.triggerElem,
          cssName: tr.cssName,
          dataName: tr.dataName,
          initVal: tr.dataValue,
          currVal: tr.currentVisualVal,
          highlighted: tr.highlighted
        }
      })
    }
    if (params) data.activeTriggerInd = this.getActiveTriggerInd(params.data.cssName)
    return data
  }

  changeOppositeTriggerWidth(data, ui) { // T
    this.triggers.forEach(o => {
      if (o.cssName === data.opositeCssName) {
        o.anotherTriggerWidth = ui.width
        o.anotherTriggerValue = ui.value
      }
    })
  }

  changeIndicatorSideValue(data, ui) { // T
    this.indicatorSides.forEach(o => {
      if (o.side === data.cssName) o.valueCurr = ui.value + ui.width
    })
  }

  get sliderWidth() {
    return this.$sliderWidth
  }
  set sliderWidth(val) {
    this.$sliderWidth = val
    this.updateTriggersSliderWidth(val)
  }

  updateTriggersSliderWidth(val) { // P
    this.triggers.forEach(o => {
      o.sliderWidth = val
    })
  }

  command(...param) {
    if (param[0] === 'reset') return this.resetSlider()
  }

  resetSlider() {
    // create array of promisified data
    const prmss = this.triggers.map(trigg => trigg.resetToInitial())
    // need to return promise
    return new Promise(resolve => {
      // wait both triggers updates
      Promise.all(prmss).then(resp => {
        // return data without active trigger
        resolve(this.returnDataSetup())
      })
    })
  }
}