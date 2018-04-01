const Target = require('./Target')

module.exports = class ManualCreator {
  constructor(headless = false, destDir = '.') {
    this.webdriver = require('selenium-webdriver')
    const chrome = require('selenium-webdriver/chrome')
    const chromedriver = require("chromedriver");
    this.By = this.webdriver.By
    this.until = this.webdriver.until
    this.headless = headless
    this.zIndex = 10000
    this.destDir = destDir

    this.fs = require('fs-extra')
    this.fs.mkdirsSync(this.destDir)
    // this.fs.copySync('man/template.html', 'manual/index.html')
    // this.fs.copySync('man/reset.css', 'manual/reset.css')
    // this.fs.copySync('man/page.css', 'manual/page.css')

    let builder = new this.webdriver.Builder().forBrowser('chrome')
    if (this.headless) {
      builder = builder.setChromeOptions(new chrome.Options().headless())
    }
    this.driver = builder.build()
  }
  find (selector) {
    this.zIndex++
    return new Target(this, selector)
  }
  async waitFor(sel, time){
      await this.driver.wait(this.until.elementLocated(this.By.css(sel), time))
  }
  async click(sel){
    await this.driver.findElement(this.By.css(sel)).click()
  }
  async wait(time) {
    await this.driver.sleep(time)
  }
  async capture (filename) {
    const dest = this.destDir
    await this.driver.takeScreenshot().then(
      function(image, err) {
        const fs = require('fs-extra')
        fs.mkdirsSync(`${dest}/`)
        fs.writeFile(`${dest}/${filename}.png`, image, 'base64', function(err) {
            console.log(err);
        })
      }
    )
    return `${dest}/${filename}.png`
  }
  async setSize (w, h) {
    const ss = await this.driver.manage().window().setRect({
      x: 0,
      y: 0,
      width: w, 
      height: h
    })
    // console.log(ss)
  }
  async fit(target, margin={x:0,y:0}) {
    const func = function (selector, selector2, margin, creator) {
      const styleString = (style) => {
        return Object.entries(style).reduce((styleString, [propName, propValue]) => {
          return `${styleString}${propName}:${propValue};`
        }, '')
      }
      let w = 0
      let h = 0

      if (!creator.headless) {
        w = window.outerWidth - window.innerWidth
        h = window.outerHeight - window.innerHeight
      }

      const rect = document.querySelector(selector).getBoundingClientRect()
      if(selector2) {
        const rect2 = document.querySelector(selector2).getBoundingClientRect()
        const top = Math.min(rect.top, rect2.top)
        const bottom = Math.max(rect.bottom, rect2.bottom)
        const left = Math.min(rect.left, rect2.left)
        const right = Math.max(rect.right, rect2.right)
        rect.x = left
        rect.y = top
        rect.width = right - left
        rect.height = bottom - top
      }
      rect.x = rect.x - margin.x
      rect.y = rect.y - margin.y
      rect.width = rect.width + w + margin.x * 2
      rect.height = rect.height + h + margin.y * 2
      return rect
    }
    const rect = await this.driver.executeScript(
      func, target.selector, target.selector2, margin, this)
    const ss = await this.driver.manage().window().setRect({
      x: 0,
      y: 0,
      width: rect.width, 
      height: rect.height
    })
    await this.driver.executeScript(`scroll(${rect.x},${rect.y})`);

    return target
  }
  quit () {
    this.driver.quit()
  }
}
