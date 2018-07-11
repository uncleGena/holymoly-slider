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
  slider = null
})

describe('Slider', function () {
  it('should be an object', function () {
    assert.isObject(slider, 'slider is not an object')
  })
})