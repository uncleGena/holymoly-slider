export default (function () {

  const toggleTransition = (elem, bool) => {
    if (bool) {
      elem.classList.add('hm-slider--animating')
    } else {
      elem.classList.remove('hm-slider--animating')
    }
  }

  return {
    toggleTransition: toggleTransition
  }

})()