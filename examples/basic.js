const manualCreator = require('../')
const ManualCreator = manualCreator.ManualCreator
const Target = manualCreator.Target

async function run (creator, props, url, f) {
  await creator.driver.get(url).then(async function () {
      await f(creator, props)
  }.bind(creator, props, f))
}

const baseURL = 'https://github.com/'
const creator = new ManualCreator(false, 'images')

const task = async (creator, props) => {
  await creator.setSize(800, 600)
  const padding = props.padding
  const offset = {x: 40, y: 0}
  const textOffset = {x: 0, y: 40}

  await creator.waitFor('.octicon-mark-github', 10000)

  const t = await creator.find('.octicon-mark-github')
    .markRect(padding)
    .numberAside(1, offset)
    .textAside("Hello Octacat!", textOffset)
    .wait()

  await creator.wait(1000)
  const f1 = await creator.capture('image-1')
  await creator.wait(1000)
  t.clear()
}

const props = {
  padding: { x: 5, y:5 }
}

const func = async () => {
  await run(creator, props, `${baseURL}`, task)
  await creator.wait(1000)
  await creator.quit()
}
func()