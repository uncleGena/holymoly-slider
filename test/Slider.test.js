import 'jsdom-global/register'
import {
  assert
} from 'chai'
import Slider from '../src/elems/Slider'

let slider = null

beforeEach(function () {
  document.body.innerHTML = `
    <link rel="stylesheet" href="./dist/hm-slider.css">
    <div class="hm-slider casino" 
      data-hm-slider 
      data-hm-slider-min="100" 
      data-hm-slider-max="60000"
      data-hm-slider-step="7"
    >
      <div class="hm-slider__underlay">

        <div class="hm-slider__trigger-1" 
          data-trigger="left"
        > </div>

        <div class="hm-slider__scroll-indicator" data-indicator> </div>

        <div class="hm-slider__trigger-2" 
          data-trigger="right"
          data-hm-slider-cut-sign="+"
        > </div>

      </div>
    </div>
    <style>
      [data-hm-slider] {
        color:red;
      }
    </style>`

  const elem = document.querySelector('[data-hm-slider]')
  slider = new Slider({
    selector: elem
  })
})

afterEach(function () {
  document.body.innerHTML = null
  slider = null
})

describe('Slider', function () {
  it('should be an object', function () {
    assert.isObject(slider, 'slider is not an object')
  })
})

describe('changeOppositeTriggerWidth', function () {
  it('should change in trigger object opposite trigger with and value', function () {

    const data = {
      cssName: 'left',
      opositeCssName: 'right'
    }

    const ui = {
      width: 111,
      value: 222
    }

    const trigg = slider.triggers.find(o => o.cssName === data.opositeCssName)
    let anotherTriggerWidth_before = trigg.anotherTriggerWidth
    let anotherTriggerValue_before = trigg.anotherTriggerValue

    slider.changeOppositeTriggerWidth(data, ui)

    let anotherTriggerWidth_after = trigg.anotherTriggerWidth
    let anotherTriggerValue_after = trigg.anotherTriggerValue

    assert(anotherTriggerWidth_before !== anotherTriggerWidth_after, 'width not change')
    assert(anotherTriggerValue_before !== anotherTriggerValue_after, 'value not change')
    assert(anotherTriggerValue_after === 222, 'set wrong value')
    assert(anotherTriggerWidth_after === 111, 'set wrong width')
  })
})

describe('changeIndicatorSideValue', function () {
  it('should change width of indicator side', function () {

    const data = {
      cssName: 'left',
      opositeCssName: 'right'
    }

    const ui = {
      width: 111,
      value: 222
    }

    let indic = slider.indicatorSides.find(o => o.side === data.opositeCssName)
    const sideCssValue_before = indic.valueCurr
    
    slider.changeIndicatorSideValue(data, ui)
    
    const sideCssValue_after = slider.indicatorSides[0].valueCurr

    assert(sideCssValue_before !== sideCssValue_after)
    assert(sideCssValue_after === ui.width + ui.value)

  })
})

describe('updateTriggersSliderWidth', function () {
  it('should update sliderWidth for each trigger')
})