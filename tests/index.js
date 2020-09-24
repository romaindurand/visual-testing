import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import startTests from '../index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


(async function () {
  const oldPath = path.join(__dirname, './images/old')
  const newPath = path.join(__dirname, './images/new')
  const diffPath = path.join(__dirname, './images/diff')

  await startTests({
    resolutions: ['100x500', '450x200', '500x500', '800x600'],
    urls: { google: 'https://google.com' },
    screenshots: { oldPath, newPath, diffPath }
  })
})()