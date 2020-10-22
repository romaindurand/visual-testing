import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import startTests from '../index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

(async function () {
  try {
    const oldPath = path.join(__dirname, './images/old')
    const newPath = path.join(__dirname, './images/new')
    const diffPath = path.join(__dirname, './images/diff')

    await startTests({
      resolutions: { mobile: 400, tablet: 500, desktop: 800 },
      urls: { google: 'https://google.com' },
      screenshots: { oldPath, newPath, diffPath },
      interactive: true
    })
  } catch (ex) {
    console.log(ex.message, ex.stack)
  }
})()
