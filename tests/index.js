import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { compareImages } from '../index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


(async function () {
  const pathOld = path.join(__dirname, './images/old')
  const pathNew = path.join(__dirname, './images/new')
  const pathDiff = path.join(__dirname, './images/diff')

  const areImagesEqual = await compareImages(pathOld, pathNew, pathDiff)

  console.log({ areImagesEqual })
})()