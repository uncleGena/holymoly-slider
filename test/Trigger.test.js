import 'jsdom-global/register'
import {
  assert
} from 'chai'
import Trigger from '../src/elems/Trigger'

// trigger instance
let trigger = null

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

  const direction = 'left'
  const element = document.querySelector(`[data-hm-slider] [data-trigger="${direction}"]`)
  trigger = new Trigger({
    dataName: 'hmSliderMin',
    dataValue: 123,
    cssName: 'left',
    element: element,
    sliderWidth: 200,
    minMaxDiapazon: 345
  })
})

afterEach(function () {
  document.body.innerHTML = ''
  trigger = null
})

describe('Trigger class element', function () {
  describe('Slider element', function () {
    it('should has a triggerElem', function () {
      assert(!!trigger.triggerElem === true, 'has not selector')
    })

    it('should has an element which is HTMLElement', function () {
      assert(trigger.triggerElem instanceof HTMLElement, 'triggerElem is not a HTMLElement')
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

  describe('eventStrart', function () {
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

  describe('eventStop', function () {
    it('should set this.active and trigger miminum css left/right value', function () {
      const x = 234
      let ev = new MouseEvent('click', {
        clientX: x
      })

      const type = 'left'
      trigger.eventStop(ev, type)

      assert(trigger.active === false, 'active state is not false')
      assert.isNumber(trigger.triggerMin, 'minimum value is not number')
    })
  })

  describe('eventMove', function () {
    it('should move trigger if trigger is active', function () {
      const x = 234
      let ev = new MouseEvent('mousemove', {
        clientX: x
      })
      trigger.active = true
      const oldVal = trigger.moveValOld
      assert(oldVal === null, 'initial value is not null')
      trigger.eventMove(ev)
      assert(trigger.moveValOld !== oldVal && trigger.moveValOld > 0, 'moved value did not change')
    })
  })

  describe('movedCursorValue', function () {

    const clicked = 345
    const moved = 234
    let ev = new MouseEvent('mousemove', {
      clientX: moved
    })
    let cursorValOnLeft;
    let cursorValOnRight;

    it('should get right value of cursor on left side', function () {
      cursorValOnLeft = trigger.movedCursorValue(ev, clicked)
      assert(cursorValOnLeft === moved - clicked, 'asdfa sdf asdf asdf ')
    })
    
    it('should get right value of cursor on right side', function () {
      trigger.cssName = 'right',
      trigger.dataName = 'hmSliderMax'
      cursorValOnRight = trigger.movedCursorValue(ev, 345)
      assert(cursorValOnRight === clicked - moved, 'asdfa sdf asdf asdf ')
    })

    it('should be proportionally equal', function () {
      assert(cursorValOnLeft !== cursorValOnRight, 'value of both cursor same when moving')
      assert(cursorValOnLeft * -1 === cursorValOnRight, 'cursor distances are not equal when moving')
    })
  })

  describe('getExactMovedValue', function () {
    it('should return value considering maximum, minimum and position of another trig', function () {
      const val = trigger.getExactMovedValue(100, 300, 400)
      assert(val === 300, 'value of trigger is wrong calculated')
    })

    it('should return value of another trigger if it cursor position more then max allow', function () {
      const val = trigger.getExactMovedValue(100, 5555, 400)
      assert(val === 400, 'value of trigger is more than max allowed')
    })

    it('should return minimum trigger value if cursor position less then minimum trig. val.', function () {
      const val = trigger.getExactMovedValue(100, 11, 400)
      assert(val === 100, 'value of trigger is less then minimum allowed')
    })
  })

  describe('getCurrentStep', function () {
    it('should return number of current step while moving in miminum state', function () {
      const val = trigger.getCurrentStep(33, 44, 100)
      assert(val === 15, 'wrong current value')
    })

    it('should return number of current step while moving in maximum state', function () {
      const val = trigger.getCurrentStep(33, 46, 100)
      assert(val === 15, 'wrong current value')
    })
  })

  describe('getMagneticMovedValue', function () {
    it('should return moving value depending on the step', function () {
      const val = parseFloat(trigger.getMagneticMovedValue(36, 7, 100).toFixed(4))
      assert(val === 42.8571, 'returns wrong value')
    })

    it('should return same value with close moving value', function () {
      const val = parseFloat(trigger.getMagneticMovedValue(49, 7, 100).toFixed(4))
      assert(val === 42.8571, 'with closest moving return wrong value')
    })
  })

  describe('getMinMaxCurrentStep', function () {
    it('should return visual value depending on step hmSliderMin', function () {
      trigger.dataValue = 777
      const val = parseFloat(trigger.getMinMaxCurrentStep(2556, 7, 4, 365.14285714285717))
      assert(val === 2237.5714285714284, 'return wrong value for hmSliderMin')
    })

    it('should return visual value depending on step hmSliderMax', function () {
      trigger.dataName = 'hmSliderMax'
      trigger.cssName = 'right'
      trigger.dataValue = 3333
      const val = parseFloat(trigger.getMinMaxCurrentStep(2556, 7, 2, 365.14285714285717))
      assert(val === 2602.714285714286, 'return wrong value for hmSliderMax')
    })
  })

  describe('addHighlightedClass', function () {
    it('should add class to trigger element', function () {
      const hasClassBefore = trigger.triggerElem.classList.contains('trigger-highlighted')
      trigger.addHighlightedClass()
      const hasClassAfter = trigger.triggerElem.classList.contains('trigger-highlighted')
      assert(trigger.highlighted === true, 'highlighted did not set')
      assert(hasClassBefore === false, 'class is already present')
      assert(hasClassAfter === true, 'did not add class')
      assert(hasClassBefore !== hasClassAfter, 'addHighlightedClass does not add class')
    })
  })

  describe('removeHighlightedClass', function () {
    it('should add class to trigger element', function () {
      trigger.addHighlightedClass()
      const hasClassBefore = trigger.triggerElem.classList.contains('trigger-highlighted')
      trigger.removeHighlightedClass()
      const hasClassAfter = trigger.triggerElem.classList.contains('trigger-highlighted')
      assert(trigger.highlighted === false, 'highlighted property did not unset')
      assert(hasClassBefore === true, 'class is not present')
      assert(hasClassAfter === false, 'did not remove class')
      assert(hasClassBefore !== hasClassAfter, 'addHighlightedClass does not add class')
    })
  })

  describe('getVisualValue', function () {
    it('should return full vusual representation of current value', function () {
      const val = trigger.getVisualValue(2556, 7, 3)
      assert(val === 1218.4285714285713, 'return wrong value')
    })
  })

  describe('toggleHighlightClass', function () {
    it('should add "trigger-highlighted" class when is active (touchstart/mousedown)', function () {
      const hasClassBefore = trigger.triggerElem.classList.contains('trigger-highlighted')
      const active = true
      const isMoved = false
      trigger.toggleHighlightClass(active, isMoved)
      const hasClassAfter = trigger.triggerElem.classList.contains('trigger-highlighted')
      assert(hasClassBefore === false, 'class is already present')
      assert(hasClassAfter === true, 'did not add class')
    })

    it('should add class when trigger moved', function () {
      const hasClassBefore = trigger.triggerElem.classList.contains('trigger-highlighted')
      const active = false
      const isMoved = true
      trigger.toggleHighlightClass(active, isMoved)
      const hasClassAfter = trigger.triggerElem.classList.contains('trigger-highlighted')
      assert(hasClassBefore === false, 'class is already present')
      assert(hasClassAfter === true, 'did not add class')
    })

    it('should remove class when trigger not active and not moved', function () {
      trigger.addHighlightedClass()
      const hasClassBefore = trigger.triggerElem.classList.contains('trigger-highlighted')
      const active = false
      const isMoved = false
      trigger.toggleHighlightClass(active, isMoved)
      const hasClassAfter = trigger.triggerElem.classList.contains('trigger-highlighted')
      assert(hasClassBefore === true, 'class is not present present')
      assert(hasClassAfter === false, 'class added')
    })
  })

  describe('isMoved', function () {
    it('should not show it was moved from min state if current pexel value is the same as minimum', function () {
      trigger.currentPixelVal = 300
      trigger.triggerMinInit = 300
      assert(trigger.isMoved() === false, 'show that it was moved')
    })

    it('should show moved if current px value is not the same as minimum', function () {
      trigger.currentPixelVal = 222
      trigger.triggerMinInit = 0
      assert(trigger.isMoved() === true, 'show that it was moved')
    })
  })

  describe('updateVisualValue', function () {
    it('should update innerHTML', function () {
      const contentBefore = trigger.triggerElem.innerHTML
      const val = 12345
      trigger.updateVisualValue(val)
      const contentAfter = parseInt(trigger.triggerElem.innerHTML)
      assert(contentAfter === val, 'content did not update')
      assert(contentBefore !== contentAfter, 'content left the same')
    })
  })

  describe('triggerElemMaxAllow', function () {
    it('should return subtraction of sliderWidth, triggerElemWidth, anotherTriggerWidth and anotherTriggerValue ', function () {
      trigger.sliderWidth = 300
      trigger.triggerElemWidth = 50
      trigger.anotherTriggerWidth = 50
      trigger.anotherTriggerValue = 133
      const val1 = trigger.triggerElemMaxAllow()
      assert(val1 === 67, 'wrong calc result')
      trigger.sliderWidth = 300
      trigger.triggerElemWidth = 56
      trigger.anotherTriggerWidth = 67
      trigger.anotherTriggerValue = 133
      const val2 = trigger.triggerElemMaxAllow()
      assert(val2 == 44, 'wrong calc result')
    })
  })

  describe('cutSignAddition', function () {
    it('should return cut sign if sign is not specified', function () {
      let cutSign = '+'
      let sign = false
      let curVal = 0
      let initVal = 0
      let val = trigger.cutSignAddition(sign, cutSign, curVal, initVal)
      assert(val === cutSign, 'cut sign do not return')
    })

    it('should return sign if sign specified', function () {
      let cutSign = '+'
      let sign = '%'
      let curVal = 0
      let initVal = 0
      let val = trigger.cutSignAddition(sign, cutSign, curVal, initVal)
      assert(val === sign, 'cut sign do not return')
    })
  })

  describe('valueFormated', function () {
    it('should return short and formated value', function () {
      assert(trigger.valueFormated(10000000) === '10m', 'wrong val for 10000000')
      assert(trigger.valueFormated(1000000) === '1.0m', 'wrong val for 1000000')
      assert(trigger.valueFormated(100000) === '100k', 'wrong val for 100000')
      assert(trigger.valueFormated(10000) === '10k', 'wrong val for 10000')
      assert(trigger.valueFormated(1000) === '1k', 'wrong val for 1000')
      assert(trigger.valueFormated(100) === '100', 'wrong val for 100')
      assert(trigger.valueFormated(10) === '10', 'wrong val for 10')
      assert(trigger.valueFormated(5) === '5.0', 'wrong val for 5')
      assert(trigger.valueFormated(1) === '1.0', 'wrong val for 1')
      assert(trigger.valueFormated(0.3) === '0.30', 'wrong val for 0.3')
      assert(trigger.valueFormated(0) === '0', 'wrong val for 0')
    })
  })

  describe('applyTriggerPosition', function () {
    it('should change left/right style of trigger', function () {
      const val = 333
      const pos_before = trigger.triggerElem.style.left
      trigger.applyTriggerPosition(val)
      const pos_affter = trigger.triggerElem.style.left
      assert(pos_before !== pos_affter, 'position did not change')
      assert(pos_affter === val + 'px', 'changed to wrong position')
    })
  })
})