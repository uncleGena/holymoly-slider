import 'jsdom-global/register'
import {
  assert
} from 'chai'
import Trigger from '../src/elems/Trigger'
import sinon from 'sinon'

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
    minMaxDiapazon: 345,
    opositeCssName: 'right'
  })
})

afterEach(function () {
  document.body.innerHTML = null
  trigger = null
})


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
    assert.equal(xCoordTouch, x, 'returns wrong x coordinates on touch event')

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

    assert.equal(trigger.clickCoord, x, 'evPageX() returns wrong click coordinates')
    assert.equal(trigger.active, true, 'active state is not set')
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

    assert.equal(trigger.active, false, 'active state is not false')
    assert.isNumber(trigger.triggerMin, 'minimum value is not number')
  })
})

describe('eventMove', function () {
  const x = 234
  let ev = new MouseEvent('mousemove', {
    clientX: x
  })

  it('should not change state if trigger is not active', function () {
    trigger.active = false
    const oldState = JSON.stringify(trigger)
    trigger.eventMove(ev)
    const newState = JSON.stringify(trigger)
    assert.deepEqual(oldState, newState, 'changed state event if was not active')
  })

  it('should change state if trigger is active', function () {
    trigger.active = true
    const oldState = JSON.stringify(trigger)
    trigger.eventMove(ev)
    const newState = JSON.stringify(trigger)
    assert.notDeepEqual(oldState, newState, 'state did not chage')
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
    assert.equal(cursorValOnLeft, moved - clicked, 'asdfa sdf asdf asdf ')
  })

  it('should get right value of cursor on right side', function () {
    trigger.cssName = 'right',
      trigger.dataName = 'hmSliderMax'
    cursorValOnRight = trigger.movedCursorValue(ev, 345)
    assert.equal(cursorValOnRight, clicked - moved, 'asdfa sdf asdf asdf ')
  })

  it('should be proportionally equal', function () {
    assert(cursorValOnLeft !== cursorValOnRight, 'value of both cursor same when moving')
    assert.equal(cursorValOnLeft * -1, cursorValOnRight, 'cursor distances are not equal when moving')
  })
})

describe('getExactMovedValue', function () {
  it('should return value considering maximum, minimum and position of another trig', function () {
    const val = trigger.getExactMovedValue(100, 300, 400)
    assert.equal(val, 300, 'value of trigger is wrong calculated')
  })

  it('should return value of another trigger if it cursor position more then max allow', function () {
    const val = trigger.getExactMovedValue(100, 5555, 400)
    assert.equal(val, 400, 'value of trigger is more than max allowed')
  })

  it('should return minimum trigger value if cursor position less then minimum trig. val.', function () {
    const val = trigger.getExactMovedValue(100, 11, 400)
    assert.equal(val, 100, 'value of trigger is less then minimum allowed')
  })
})

describe('getCurrentStep', function () {
  it('should return number of current step while moving in miminum state', function () {
    const val = trigger.getCurrentStep(33, 44, 100)
    assert.equal(val, 15, 'wrong current value')
  })

  it('should return number of current step while moving in maximum state', function () {
    const val = trigger.getCurrentStep(33, 46, 100)
    assert.equal(val, 15, 'wrong current value')
  })
})

describe('getMagneticMovedValue', function () {
  it('should return moving value depending on the step', function () {
    const val = parseFloat(trigger.getMagneticMovedValue(36, 7, 100).toFixed(4))
    assert.equal(val, 42.8571, 'returns wrong value')
  })

  it('should return same value with close moving value', function () {
    const val = parseFloat(trigger.getMagneticMovedValue(49, 7, 100).toFixed(4))
    assert.equal(val, 42.8571, 'with closest moving return wrong value')
  })
})

describe('getMinMaxCurrentStep', function () {
  it('should return visual value depending on step hmSliderMin', function () {
    trigger.dataValue = 777
    const val = parseFloat(trigger.getMinMaxCurrentStep(2556, 7, 4, 365.14285714285717))
    assert.equal(val, 2237.5714285714284, 'return wrong value for hmSliderMin')
  })

  it('should return visual value depending on step hmSliderMax', function () {
    trigger.dataName = 'hmSliderMax'
    trigger.cssName = 'right'
    trigger.dataValue = 3333
    const val = parseFloat(trigger.getMinMaxCurrentStep(2556, 7, 2, 365.14285714285717))
    assert.equal(val, 2602.714285714286, 'return wrong value for hmSliderMax')
  })
})

describe('addHighlightedClass', function () {
  it('should add class to trigger element', function () {
    const hasClassBefore = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    trigger.addHighlightedClass()
    const hasClassAfter = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    assert.equal(trigger.highlighted, true, 'highlighted did not set')
    assert.equal(hasClassBefore, false, 'class is already present')
    assert.equal(hasClassAfter, true, 'did not add class')
    assert(hasClassBefore !== hasClassAfter, 'addHighlightedClass does not add class')
  })
})

describe('removeHighlightedClass', function () {
  it('should add class to trigger element', function () {
    trigger.addHighlightedClass()
    const hasClassBefore = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    trigger.removeHighlightedClass()
    const hasClassAfter = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    assert.equal(trigger.highlighted, false, 'highlighted property did not unset')
    assert.equal(hasClassBefore, true, 'class is not present')
    assert.equal(hasClassAfter, false, 'did not remove class')
    assert(hasClassBefore !== hasClassAfter, 'addHighlightedClass does not add class')
  })
})

describe('getVisualValue', function () {
  it('should return full vusual representation of current value', function () {
    const val = trigger.getVisualValue(2556, 7, 3)
    assert.equal(val, 1218.4285714285713, 'return wrong value')
  })
})

describe('toggleHighlightClass', function () {
  it('should add "trigger-highlighted" class when is active (touchstart/mousedown)', function () {
    const hasClassBefore = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    const active = true
    const isMoved = false
    trigger.toggleHighlightClass(active, isMoved)
    const hasClassAfter = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    assert.equal(hasClassBefore, false, 'class is already present')
    assert.equal(hasClassAfter, true, 'did not add class')
  })

  it('should add class when trigger moved', function () {
    const hasClassBefore = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    const active = false
    const isMoved = true
    trigger.toggleHighlightClass(active, isMoved)
    const hasClassAfter = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    assert.equal(hasClassBefore, false, 'class is already present')
    assert.equal(hasClassAfter, true, 'did not add class')
  })

  it('should remove class when trigger not active and not moved', function () {
    trigger.addHighlightedClass()
    const hasClassBefore = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    const active = false
    const isMoved = false
    trigger.toggleHighlightClass(active, isMoved)
    const hasClassAfter = trigger.triggerElem.classList.contains('hm-slider--trigger-highlighted')
    assert.isTrue(hasClassBefore, 'class is not present present')
    assert.isFalse(hasClassAfter, 'class added')
  })
})

describe('isMoved', function () {
  it('should not show it was moved from min state if current pexel value is the same as minimum', function () {
    trigger.currentPixelVal = 300
    trigger.triggerMinInit = 300
    assert.isFalse(trigger.isMoved(), 'show that it was moved')
  })

  it('should show moved if current px value is not the same as minimum', function () {
    trigger.currentPixelVal = 222
    trigger.triggerMinInit = 0
    assert.isTrue(trigger.isMoved(), 'show that it was moved')
  })
})

describe('updateVisualValue', function () {
  it('should update innerHTML', function () {
    const contentBefore = trigger.triggerElem.innerHTML
    const val = 12345
    trigger.updateVisualValue(val)
    const contentAfter = parseInt(trigger.triggerElem.innerHTML)
    assert.equal(contentAfter, val, 'content did not update')
    assert.notEqual(contentBefore, contentAfter, 'content left the same')
  })
})

describe('triggerElemMaxAllow', function () {
  it('should return subtraction of sliderWidth, triggerElemWidth, anotherTriggerWidth and anotherTriggerPxValue ', function () {
    trigger.sliderWidth = 300
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50
    trigger.anotherTriggerPxValue = 133
    const val1 = trigger.triggerElemMaxAllow()
    assert.equal(val1, 67, 'wrong calc result')
    trigger.sliderWidth = 300
    trigger.triggerElemWidth = 56
    trigger.anotherTriggerWidth = 67
    trigger.anotherTriggerPxValue = 133
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
    assert.equal(val, cutSign, 'cut sign do not return')
  })

  it('should return sign if sign specified', function () {
    let cutSign = '+'
    let sign = '%'
    let curVal = 0
    let initVal = 0
    let val = trigger.cutSignAddition(sign, cutSign, curVal, initVal)
    assert.equal(val, sign, 'cut sign do not return')
  })
})

describe('valueFormated', function () {
  it('should return short and formated value', function () {
    assert.equal(trigger.valueFormated(10000000), '10m', 'wrong val for 10000000')
    assert.equal(trigger.valueFormated(1000000), '1.0m', 'wrong val for 1000000')
    assert.equal(trigger.valueFormated(100000), '100k', 'wrong val for 100000')
    assert.equal(trigger.valueFormated(10000), '10k', 'wrong val for 10000')
    assert.equal(trigger.valueFormated(1000), '1k', 'wrong val for 1000')
    assert.equal(trigger.valueFormated(100), '100', 'wrong val for 100')
    assert.equal(trigger.valueFormated(10), '10', 'wrong val for 10')
    assert.equal(trigger.valueFormated(5), '5', 'wrong val for 5')
    assert.equal(trigger.valueFormated(1), '1', 'wrong val for 1')
    assert.equal(trigger.valueFormated(0.3), '0.3', 'wrong val for 0.3')
    assert.equal(trigger.valueFormated(0), '0', 'wrong val for 0')
  })
})

describe('applyTriggerPosition', function () {
  it('should change left/right style of trigger', function () {
    const val = 333
    const pos_before = trigger.triggerElem.style.left
    trigger.applyTriggerPosition(val)
    const pos_affter = trigger.triggerElem.style.left
    assert.notEqual(pos_before, pos_affter, 'position did not change')
    assert.equal(pos_affter, val + 'px', 'changed to wrong position')
  })
})

describe('resetToInitial', function () {
  it('should call this.setNewValue with this.dataValue', function () {
    trigger.setNewValue = sinon.spy()
    const prom = trigger.resetToInitial()
    assert.isTrue(trigger.setNewValue.calledOnce, 'setNewValue did not call')
    assert.isTrue(prom instanceof Promise, 'do not return promise')
  })

  it('should return promise with object', async function () {
    const fakeData = {
      fake: false
    }
    sinon.stub(trigger, 'dataToReturn').callsFake(() => fakeData)
    const prom = trigger.resetToInitial()
    const data = await prom.then(data => data)
    assert.deepEqual(data, fakeData, 'return wrong object')
  })
})

describe('dataToReturn', function () {
  it('should return object with proper keys', function () {
    const returnObj = trigger.dataToReturn()
    const keys = ['data', 'ui', ]
    const dataKeys = ['cssName', 'opositeCssName', 'value']
    const uiKeys = ['width', 'value']

    assert.hasAllKeys(returnObj, keys, 'miss "data" or "ui" keys from object')
    assert.hasAllKeys(returnObj.data, dataKeys, 'miss some keys from object.data')
    assert.hasAllKeys(returnObj.ui, uiKeys, 'miss some keys from object.ui')
  })
})

describe('getVisualValueWithCutSign', function () {
  it('should return formatted value with cut sign if formatNumber is true', function () {
    trigger.formatNumber = true
    trigger.currentVisualVal = 23000
    trigger.sign = false
    trigger.cutSign = '+'
    trigger.dataValue = 23000
    const val = trigger.getVisualValueWithCutSign()
    assert.strictEqual(val, '23k+', 'wrong formating of visual value')
  })

  it('should return formatted value without cut sign if current value not on initial state', function () {
    trigger.formatNumber = true
    trigger.currentVisualVal = 23000
    trigger.sign = false
    trigger.cutSign = '+'
    trigger.dataValue = 111
    const val = trigger.getVisualValueWithCutSign()
    assert.strictEqual(val, '23k', 'wrong formating of visual value')
  })

  it('should return value without cutSign (+/-) if it is not specified', function () {
    trigger.formatNumber = true
    trigger.currentVisualVal = 23000
    trigger.sign = false
    trigger.cutSign = false
    trigger.dataValue = 23000
    const val = trigger.getVisualValueWithCutSign()
    assert.strictEqual(val, '23k', 'wrong formating of visual value')
  })

  it('should return long version of value if formating not set', function () {
    trigger.formatNumber = false
    trigger.currentVisualVal = 23000
    trigger.sign = false
    trigger.cutSign = false
    const val = trigger.getVisualValueWithCutSign()
    assert.strictEqual(val, '23000', 'wrong formating of visual value')
  })
})

describe('updateCurrentState', function () {
  it('should update current state', function () {
    const stateBefore = JSON.parse(JSON.stringify(trigger))
    trigger.sliderWidth = 400
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50
    trigger.anotherTriggerPxValue = 70
    trigger.triggerMinInit = 0
    trigger.step = 1
    trigger.minMaxDiapazon = 2500

    trigger.updateCurrentState(345)

    const stateAfter = JSON.parse(JSON.stringify(trigger))
    assert.notEqual(stateBefore.currentVisualVal, stateAfter.currentVisualVal, 'currentVisualVal did not cahnge')
    assert.notEqual(stateBefore.currentPixelVal, stateAfter.currentPixelVal, 'currentPixelVal did not change')
    assert.notDeepEqual(stateBefore, stateAfter, 'state did not change')
  })

  it('should update currentPixelVal', function () {
    trigger.currentPixelVal = 123
    const valBefore = trigger.currentPixelVal
    trigger.updateCurrentState(345)
    const valAfter = trigger.currentPixelVal
    assert.equal(valBefore, 123)
    assert.notEqual(valBefore, valAfter, 'currentPixelVal did not change')
  })

  it('should update currentVisualVal', function () {
    trigger.minMaxDiapazon = 444
    trigger.currentPixelVal = 123
    trigger.triggerMinInit = 0
    trigger.sliderWidth = 600
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50
    trigger.anotherTriggerPxValue = 50

    const valBefore = trigger.currentVisualVal
    trigger.updateCurrentState(345)
    const valAfter = trigger.currentVisualVal

    assert.equal(valBefore, 123)
    assert.notEqual(valBefore, valAfter, 'currentPixelVal did not change')
  })
})

describe('formatValueOrNot', function () {
  it('should return string with formated value if this.formatNumber', function () {
    trigger.formatNumber = true
    trigger.currentVisualVal = 300000
    const val = trigger.formatValueOrNot()
    assert.isString(val, 'formatted value is not a string')
    assert.notEqual(val, '300000', 'did not format value if value is 300000')
  })

  it('should return string with decimal if not this.formatNumber', function () {
    trigger.formatNumber = false
    trigger.currentVisualVal = 123.2345
    const val = trigger.formatValueOrNot()
    assert.isString(val, 'value is not a string')
    assert.equal(val, '123.23', 'value did not parseFloated and toFixed(2)')
  })
})

describe('minMaxPxRange', function () {
  it('should return proper calculation of sliderWidth triggerElemWidth anotherTriggerWidth', function () {
    trigger.sliderWidth = 200
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50
    const val = trigger.minMaxPxRange()
    assert.equal(val, 100, 'wrong value')
  })
})

describe('getGainedPxFromVisualVal', function () {
  it('should return px value of trigger position according to trigger visual value', function () {
    trigger.sliderWidth = 200
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50

    trigger.minMaxDiapazon = 300
    trigger.dataValue = 50

    const val = trigger.getGainedPxFromVisualVal(200)
    assert.equal(val, 50, 'wrong transformation visual value in to px position')
  })

  it('should return same value event if new value lower than 0', function () {
    trigger.sliderWidth = 200
    trigger.triggerElemWidth = 50
    trigger.anotherTriggerWidth = 50

    trigger.minMaxDiapazon = 300
    trigger.dataValue = 50

    const val = trigger.getGainedPxFromVisualVal(-100)
    assert.equal(val, 50, 'wrong transformation visual value in to px position')
  })

})

describe('setNewValue', function () {
  it('should execute all 7 functions', function () {
    trigger.getGainedPxFromVisualVal = sinon.spy()
    trigger.updateCurrentState = sinon.spy()
    trigger.updateVisualValue = sinon.spy()
    trigger.updateIndicator = sinon.spy()
    trigger.applyTriggerPosition = sinon.spy()
    trigger.eventStop = sinon.spy()
    trigger.nofity = sinon.spy()
    trigger.getVisualValueWithCutSign = sinon.spy()
    trigger.dataToReturn = sinon.spy()

    trigger.setNewValue(345)

    assert.isTrue(trigger.getGainedPxFromVisualVal.calledOnce, 'getGainedPxFromVisualVal was not executed once')
    assert.isTrue(trigger.updateCurrentState.calledOnce, 'updateCurrentState was not executed once')
    assert.isTrue(trigger.updateVisualValue.calledOnce, 'updateVisualValue was not executed once')
    assert.isTrue(trigger.updateIndicator.calledOnce, 'updateIndicator was not executed once')
    assert.isTrue(trigger.applyTriggerPosition.calledOnce, 'applyTriggerPosition was not executed once')
    assert.isTrue(trigger.eventStop.calledOnce, 'eventStop was not executed once')
    assert.isTrue(trigger.nofity.calledOnce, 'nofity was not executed once')
    assert.isTrue(trigger.getVisualValueWithCutSign.calledOnce, 'getVisualValueWithCutSign was not executed once')
    sinon.assert.callCount(trigger.dataToReturn, 2, 'this.dataToReturn() was not called twice')
  })
})

describe('updatePosition', function () {
  it('should set new value with disabled max allowed width', function () {
    trigger.setNewValue = sinon.spy()
    trigger.currentVisualVal = 300
    trigger.updatePosition()
    const assertion = trigger.setNewValue.calledOnceWith(trigger.currentVisualVal, true)
    assert.isTrue(assertion, 'function calledOnceWith was called with wrong args')
  })
})

describe('moveTrigger', function () {
  it('should get new value and update current state', function () {
    trigger.movedCursorValue = sinon.spy()
    trigger.updateCurrentState = sinon.spy()
    const mouseMove = new MouseEvent('mousemove', {
      clientX: 333
    })
    trigger.moveTrigger(mouseMove)
    assert.isTrue(trigger.movedCursorValue.calledOnce, 'movedCursorValue did not call')
    assert.isTrue(trigger.updateCurrentState.calledOnce, 'updateCurrentState did not call')
  })

  it('should not make actions if new pixel value did not changed')
  it('should make actions if new pixel value did changed')
})

describe('constructor', function () {
  it('should add event listener on mouseup', function () {
    trigger.eventStop = sinon.spy();
    let ev = new MouseEvent('mouseup', {
      clientX: 5
    })
    document.dispatchEvent(ev)
    assert.equal(trigger.eventStop.callCount, 1, 'mouseup event was not called once')
  })

  it('should add event listener on touchend', function () {
    trigger.eventStop = sinon.spy();
    let ev = new TouchEvent('touchend', {
      changedTouches: [{
        clientX: 333
      }]
    })
    document.dispatchEvent(ev)
    assert.equal(trigger.eventStop.callCount, 1, 'touchend event was not called once')
  })

  it('should add event listener on mousemove', function () {
    trigger.eventMove = sinon.spy();
    let ev = new MouseEvent('mousemove')
    document.dispatchEvent(ev)
    assert.equal(trigger.eventMove.callCount, 1, 'mousemove event was not called once')
  })

  it('should add event listener on touchmove', function () {
    trigger.eventMove = sinon.spy();
    let ev = new TouchEvent('touchmove')
    document.dispatchEvent(ev)
    assert.equal(trigger.eventMove.callCount, 1, 'touchmove event was not called once')
  })

  it('should add event listener "mousedown" to trigger element', function () {
    trigger.isTouchDevice = true
    trigger.eventStart = sinon.spy();
    let ev = new MouseEvent('mousedown')

    trigger.triggerElem.dispatchEvent(ev)

    assert.equal(trigger.eventStart.callCount, 1, 'mousedown event was not called once')
    assert.isFalse(trigger.isTouchDevice, 'did change isTouchDevice to false')
  })

  it('should add event listener "touchstart" to trigger element', function () {
    trigger.isTouchDevice = false
    trigger.eventStart = sinon.spy();
    let ev = new MouseEvent('touchstart')

    trigger.triggerElem.dispatchEvent(ev)

    assert.equal(trigger.eventStart.callCount, 1, 'touchstart event was not called once')
    assert.isTrue(trigger.isTouchDevice, 'did change isTouchDevice to false')
  })

  it('should fire functions', function () {
    trigger = null
    Trigger.prototype.updateVisualValue = sinon.spy()

    const direction = 'left'
    const element = document.querySelector(`[data-hm-slider] [data-trigger="${direction}"]`)
    trigger = new Trigger({
      dataName: 'hmSliderMin',
      dataValue: 123,
      cssName: 'left',
      element: element,
      sliderWidth: 200,
      onStart: sinon.spy(),
      notify: sinon.spy(),
      minMaxDiapazon: 345
    })
    assert.equal(trigger.updateVisualValue.callCount, 1, 'updateVisualValue was not called once')
    assert.equal(trigger.nofity.callCount, 1, 'nofity was not called once')
    assert.equal(trigger.onStart.callCount, 1, 'onStart was not called once')
  })

  it('should has props', function () {
    assert.isDefined(trigger.triggerMinInit, 'triggerMinInit not present in constructor')
    assert.isDefined(trigger.triggerMin, 'triggerMin not present in constructor')
    assert.isDefined(trigger.triggerElemWidth, 'triggerElemWidth not present in constructor')
    assert.isDefined(trigger.currentPixelVal, 'currentPixelVal not present in constructor')
    assert.isDefined(trigger.currentVisualVal, 'currentVisualVal not present in constructor')
    assert.isDefined(trigger.anotherTriggerWidth, 'anotherTriggerWidth not present in constructor')
    assert.isDefined(trigger.anotherTriggerPxValue, 'anotherTriggerPxValue not present in constructor')
    assert.isDefined(trigger.dataName, 'dataName not present in constructor')
    assert.isDefined(trigger.dataValue, 'dataValue not present in constructor')
    assert.isDefined(trigger.cssName, 'cssName not present in constructor')
    assert.isDefined(trigger.opositeCssName, 'opositeCssName not present in constructor')
    assert.isDefined(trigger.triggerElem, 'triggerElem not present in constructor')
    assert.isDefined(trigger.sliderWidth, 'sliderWidth not present in constructor')
    assert.isDefined(trigger.minMaxDiapazon, 'minMaxDiapazon not present in constructor')
    assert.isDefined(trigger.nofity, 'nofity not present in constructor')
    assert.isDefined(trigger.onStart, 'onStart not present in constructor')
    assert.isDefined(trigger.onChangeStart, 'onChangeStart not present in constructor')
    assert.isDefined(trigger.onChange, 'onChange not present in constructor')
    assert.isDefined(trigger.onChangeEnd, 'onChangeEnd not present in constructor')
    assert.isDefined(trigger.valuePerStep, 'valuePerStep not present in constructor')
    assert.isDefined(trigger.step, 'step not present in constructor')
    assert.isDefined(trigger.updateIndicator, 'updateIndicator not present in constructor')
    assert.isDefined(trigger.formatNumber, 'formatNumber not present in constructor')
    assert.isDefined(trigger.sign, 'sign not present in constructor')
  })
})
