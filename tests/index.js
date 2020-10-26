import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import serveStatic from 'serve-static'
import finalhandler from 'finalhandler'

import startTests from '../index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
var serve = serveStatic(path.join(__dirname, 'public'), { index: 'index.html' })

;(async function () {
  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  }).listen(5000)

  try {
    await startTests({
      resolutions: { mobile: 350, tablet: 500, desktop: 800 },
      urls: [
        { name: 'square', url: 'http://localhost:5000/?square' },
        { name: 'circle', url: 'http://localhost:5000/?circle' },
        {
          name: 'anim',
          url: 'http://localhost:5000/?anim',
          options: {
            waitFor: {
              type: 'timeout',
              value: 1100
            }
          }
        }
      ],
      screenshots: path.join(__dirname, './images'),
      interactive: true
    })
  } catch (ex) {
    console.log(ex.message, ex.stack)
  } finally {
    server.close()
  }
})()
