// TODO:同期処理はここを参考に書き直したい
// https://qiita.com/nazomikan/items/40b86dc5619bb1795aaa

module.exports = class Target {
    constructor (creator, selector, zIndex=0) {
      this.creator = creator
      this.driver = creator.driver
      //
      this.selector = selector
      this.selector2 = undefined
      this.anchor = undefined
      this.ids = []
      this.zIndex = zIndex
    }
    styleString(style) {
      return Object.entries(style).reduce((styleString, [propName, propValue]) => {
        return `${styleString}${propName}:${propValue};`
      }, '')
    }
    uuid () {
      var uuid = "", i, random;
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
  
        if (i == 8 || i == 12 || i == 16 || i == 20) {
          uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
      }
      return uuid;
    }
    setFieldValue (value) {
      const selTarget = this.driver.findElement(this.creator.By.css(this.selector))
      selTarget.clear()
      selTarget.sendKeys(value)
      return this
    }
    range(selector) {
      this.selector2 = selector
      return this
    }
    setStyle(style) {
      style = Object.assign({}, style)
      const func = function (selector, style) {
        const styleString = (style) => {
          return Object.entries(style).reduce((styleString, [propName, propValue]) => {
            return `${styleString}${propName}:${propValue};`
          }, '')
        }
        document.querySelector(selector).style = styleString(style)
      }
      this.driver.executeScript(func, this.selector, style)
      return this
    }
    markRect (padding, style) {
      padding = Object.assign({}, padding)
      style = Object.assign({}, style)
      const func = function (selector, selector2, style, id, padding) {
        const styleString = (style) => {
          return Object.entries(style).reduce((styleString, [propName, propValue]) => {
            return `${styleString}${propName}:${propValue};`
          }, '')
        }
        let rect = document.querySelector(selector).getBoundingClientRect()
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
        const element = document.createElement('div')
        element.id = id
        const offset = padding
        element.style = styleString(Object.assign({
          "position": 'absolute',
          "top": `${rect.top + window.pageYOffset - offset.y}px`,
          "left": `${rect.left + window.pageXOffset - offset.x}px`,
          "width": `${rect.width + offset.x * 2}px`,
          "height": `${rect.height + offset.y * 2}px`,
          "border": '3px solid palevioletred',
          'z-index': 10000
        }, style))
        document.body.appendChild(element)
      }
      const id = this.uuid()
      this.ids.push(id)
      this.driver.executeScript(func, this.selector, this.selector2, style, id, padding)
      return this
    }
    textAside (text, offset, style) {
      offset = Object.assign({}, offset)
      style = Object.assign({}, style)
      const func = function (selector, id, text, offset, style) {
        const target = document.querySelector(selector)
        const styleString = (style) => {
          return Object.entries(style).reduce((styleString, [propName, propValue]) => {
            return `${styleString}${propName}:${propValue};`
          }, '')
        }
        const rect = target.getBoundingClientRect()
        const element = document.createElement('div')
        element.id = id
        const newContent = document.createTextNode(`${text}`)
        element.appendChild(newContent)
        element.style = styleString(
          Object.assign({
            "position": 'absolute',
            "top": `${rect.top + window.pageYOffset + rect.height / 2 - 16 + offset.y}px`,
            "left": `${rect.left + window.pageXOffset + offset.x}px`,
            "font-size": '32px',
            "width": '32px',
            "height": '32px',
            'text-align': 'center',
            'line-height': '32px',
            "color": 'palevioletred',
            'z-index': 10000
          }, style)
        )
        console.log(element.style)
        document.body.appendChild(element)
      }
      const id = this.uuid()
      this.ids.push(id)
      this.driver.executeScript(func, this.selector, id, text, offset, style)
      return this
    }
    numberAside (num, offset) {
      offset = Object.assign({}, offset)
      return this.textAside(num, offset, 
        {
          "font-size": '22px',
          "background-color": 'palevioletred',
          "color": 'white',
          "border-radius": '50%'
        }
      )
    }
    fit(margin={x:0, y:0}) {
      margin = Object.assign({}, margin)
      this.creator.fit(this, margin)
      return this
    }
    wait () {
      this.anchor = this.uuid()
      this.ids.push(this.anchor)
      const func = function (anchor) {
        const styleString = (style) => {
          return Object.entries(style).reduce((styleString, [propName, propValue]) => {
            return `${styleString}${propName}:${propValue};`
          }, '')
        }
        const element = document.createElement('div')
        element.id = anchor
        element.style = styleString({
          "position": 'absolute',
          "top": '0px',
          "left": '0px'
        })
        document.body.appendChild(element)
      }
      this.driver.executeScript(func, this.anchor)
      this.driver.wait(this.creator.until.elementLocated(this.creator.By.id(this.anchor)), 10000)
      return this
    }
    clear () {
      const func = function (ids) {
        ids.forEach((e) => {
          const elem = document.getElementById(e)
          if(elem) {
            elem.remove()
          }
        })
      }
      this.driver.executeScript(func, this.ids)
    }
  }