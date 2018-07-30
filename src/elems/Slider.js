import Trigger from './Trigger'
import IndicatorSide from './IndicatorSide';
import {
  rejects
} from 'assert';

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
    this.step = parseFloat(this.dataSet[this.sliderStepName])
    this.sliderVisualMin = this.dataSet['hmSliderMin']
    this.sliderVisualMax = this.dataSet['hmSliderMax']

    this.triggers = this.triggersConfig.map(o => {
      return new Trigger(this.triggerPropsConfig(o))
    })

    this.indicatorSides = this.triggersConfig.map(o => {
      return new IndicatorSide({
        baseElement: this.sliderElem,
        side: o.cssName
      })
    })

    this.assignSliderWidth()

    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        this.assignSliderWidth()
        this.updateTriggersPositions()
      }, 50)
    }, false);

    const evr = document.querySelector("*")
    evr.addEventListener("animationend", this.assignSliderWidth.bind(this), false);
    evr.addEventListener("transitionend", this.assignSliderWidth.bind(this), false);

    this.onInit(this.returnDataSetup())
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
      notify: props => {
        setTimeout(() => {
          this.changeOppositeTriggerWidth(props.data, props.ui)
        })
      },
      onStart: (props) => {

      },
      onChangeStart: props => {
        this.onChangeStart && this.onChangeStart(this.returnDataSetup(props))
      },
      onChange: props => {
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

  assignSliderWidth() {
    this.sliderWidth = parseFloat(window.getComputedStyle(this.sliderElem)['width'])
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
        dataset: Object.assign({}, this.dataSet),
        elem: this.sliderElem
      },
      triggers: this.triggers.map(tr => {
        return {
          elem: tr.triggerElem,
          cssName: tr.cssName,
          dataName: tr.dataName,
          valInit: tr.dataValue,
          valCurr: tr.currentVisualVal,
          highlighted: tr.highlighted,
          dataset: Object.assign({}, tr.triggerDataset)
        }
      })
    }
    if (params) data.activeTriggerInd = this.getActiveTriggerInd(params.data.cssName)
    return data
  }

  updateTriggersPositions() {
    this.toggleAnimatingState(true)
    this.triggers.forEach(tr => {
      tr.updatePosition()
    })
    setTimeout(() => {
      this.toggleAnimatingState(false)
    }, 333)
  }

  changeOppositeTriggerWidth(data, ui) { // T
    this.triggers.forEach(o => {
      if (o.cssName === data.opositeCssName) {
        o.anotherTriggerWidth = ui.width
        o.anotherTriggerPxValue = ui.value
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

  updateTriggersSliderWidth(val) { // T
    this.triggers.forEach(o => {
      o.sliderWidth = val
    })
  }

  toggleAnimatingState(bool) { // T
    this.triggers.forEach(o => o.isAnimating = bool)
    this.indicatorSides.forEach(o => o.isAnimating = bool)
  }

  // valInAllowedRange(val) {
  //   return (val < this.sliderVisualMin || val > this.sliderVisualMax) ? false : true
  // }

  setParamsIsValid(params) {
    const newMin = params['hmSliderMin']
    const newMax = params['hmSliderMax']

    if (newMin !== undefined && newMax !== undefined) {
      if (newMin > newMax) {
        console.warn(`[holymoly-slider] New min value (${newMin}) should not be higher than new max value (${newMax})`)
        return false
      }
    }

    if (newMin < this.sliderVisualMin) {
      console.warn(`[holymoly-slider] New min value (${newMin}) is less than allowed (${this.sliderVisualMin})`)
      return false
    }

    if (newMax > this.sliderVisualMax) {
      console.warn(`[holymoly-slider] New max value (${newMax}) should not be higher than allowed (${this.sliderVisualMax})`)
      return false
    }

    return true
  }

  command(...param) {
    if (param[0] === 'reset') return this.resetSlider(param[1])
    if (param[0] === 'update') return this.updateSliderUI()
    if (param[0] === 'set') return this.setTriggersValues(param[1], param[2])
  }

  setTriggersValues(params, duration) {
    return new Promise((resolve, reject) => {
      if (this.setParamsIsValid(params)) {

        this.triggers.map(trigg => {
          this.toggleAnimatingState(true)
          const val = params[trigg.dataName]
          if (params.hasOwnProperty(trigg.dataName)) {
            trigg.setNewValue(val)
            setTimeout(() => {
              this.toggleAnimatingState(false)
              resolve(this.returnDataSetup())
            }, duration || 300)
          }
        })

      } else {
        reject('[holymoly-slider] Set params is not valid.')
      }
    })
  }

  resetSlider(duration) {
    this.toggleAnimatingState(true)

    // create array of promisified data
    const prmss = this.triggers.map(trigg => trigg.resetToInitial())
    // need to return promise
    return new Promise(resolve => {
      // wait both triggers updates
      Promise.all(prmss).then(resp => {
        // return data without active trigger
        setTimeout(() => {
          this.toggleAnimatingState(false)
          resolve(this.returnDataSetup())
        }, duration || 300)
      })
    })
  }

  updateSliderUI() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.assignSliderWidth()
        setTimeout(() => {
          // return data without active trigger
          resolve(this.returnDataSetup())
        })
      })
    })
  }
}