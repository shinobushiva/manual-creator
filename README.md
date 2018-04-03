# Manual Creator 

This is a Selenium wrapper to create manual for web based system.

## setup
```
$ npm install
```

## run sample
```
$ node examples/basic.js
```

## This is the code flagment of example/basic.js
```
// markup octcat with rectangle, number and text
const t = await creator.find('.octicon-mark-github')
  .markRect(padding)
  .numberAside(1, offset)
  .textAside("Hello Octacat!", textOffset)
  .wait()

// save capture
await creator.wait(1000)
const f1 = await creator.capture('image-1')

// clear markers
await creator.wait(1000)
t.clear()
```

