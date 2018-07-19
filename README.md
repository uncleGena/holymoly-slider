# Holymoly slider
NOTE: it is in beta stage!

This is dependency free drag slider used on www.holymolycasinos.com/casinos

## Getting Started

html
```html
<div class="hm-slider casino">  <!-- you may change theme 'casino' to 'slot' -->
    data-hm-slider
    data-hm-slider-min="100" 
    data-hm-slider-max="12000" 
    data-hm-slider-step="50"
>
    <div class="hm-slider__underlay">
        <div class="hm-slider__trigger-1" data-trigger="left"  data-custom-name="global_score_min"> </div>
        <div class="hm-slider__scroll-indicator" data-indicator> </div>
        <div class="hm-slider__trigger-2" data-trigger="right" data-hm-slider-cut-sign="+"  data-custom-name="global_score_max"> </div>
    </div>
</div>
```

js
```javascript
import hmSlider from 'holymoly-slider'

const slider = hmSlider({
  selector: document.querySelector('[data-hm-slider]'),
  formatNumber: true, // changes '12345' to '12.3k' (default false)
  step: 100, // you can specify step here
  onInit: data => console.log('onInitEvent', data),
  onChangeStart:  data => console.log('onChangeStart', data),
  onChange:  data => console.log('onChange', data),
  onChangeEnd:  data => console.log('onChangeEnd', data)
})

// reset slider to initial values
slider.command('reset').then(data => {
  console.log('reseted to initial values::', data)
})

// if you initialized slider under display:none property, you should update it 
// after you make it visible again
slider.command('update').then(data => {
  console.log("slider ui recalculated::", data)
})
```

scss
```scss
@import "from/node_modules/holymoly-slider/dist/hm-slider";
```
Or copy styles from there and use only the theme that you need

## Installing


```
npm i --save holymoly-slider
```


