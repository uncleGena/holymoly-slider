import 'jsdom-global/register'
import {
  assert
} from 'chai'
import Trigger from '../src/elems/Trigger'

// trigger instance
let trigger = null

beforeEach(function () {
  document.body.innerHTML = `
    <div class="hm-slider casino" data-hm-slider data-min="100" data-max="60000">
      <div class="hm-slider__underlay">

        <div class="hm-slider__trigger-1" data-trigger="left"> </div>
        <div class="hm-slider__scroll-indicator" data-indicator> </div>
        <div class="hm-slider__trigger-2" data-trigger="right"> </div>

      </div>
    </div>
    <style>
      [data-hm-slider] {
        color:red;
      }
    </style>`

    trigger = new Trigger({
      name: 'left',
      selector: '[data-hm-slider]',
      sliderWidth: 200
    })
})

afterEach(function () {
  document.body.innerHTML = ''
  trigger = null
})

describe('Trigger class element', function () {
  describe('Slider element', function () {
    it('should has selector', function () {
  
      assert(!!trigger.triggerElem === true, 'has not selector')
  
    })
  })
  
  describe('evPageX function', function () {
    it('should return proper clientX value depending on device type', function () {
  
      const x = 234
  
      const evMouse = new MouseEvent('click', {
        clientX: x
      })
      const xCoordMouse = trigger.evPageX(evMouse, false)
      assert(xCoordMouse === x, 'returns wrong x coordinates on mouse event')
  
      const evTouch = new TouchEvent('touchstart', {
        changedTouches: [{
          clientX: x
        }]
      })
      const xCoordTouch = trigger.evPageX(evTouch, true)
      assert(xCoordTouch === x, 'returns wrong x coordinates on touch event')
  
    })
  })
  
  describe('eventStrart function', function () {
    it('should change state', function () {
      const x = 234
      let ev = new MouseEvent('click', {
        clientX: x
      })
  
      const type = 'left'
      trigger.eventStart(ev, type)
  
      assert(trigger.clickCoord === x, 'evPageX() returns wrong click coordinates')
      assert(trigger.active === true, 'active state is not set')
    })
  })
})