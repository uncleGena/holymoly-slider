import 'jsdom-global/register'
import {
  assert
} from 'chai'
import {hmSlider} from '../src/index.js'

describe('testing test', function () {
  it('should return -1 when the value is not present', function () {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
})

describe('hmSlider', function () {
  it('shuld be function', function () {
    assert.typeOf(hmSlider, 'function', 'is not function');
  })
})