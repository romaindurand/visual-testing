import loadImage from 'image-pixels'
import imageEqual from 'image-equal'
import { promises as fs } from 'fs'
import each from 'p-each-series'
import path from 'path'

import initPath from './initPath.js'

export default async function compareImages (path1, path2, pathDiff, interactive) {
  await initPath(pathDiff, interactive)

  const [imageFileNames1, imageFileNames2] = await Promise.all([
    fs.readdir(path1),
    fs.readdir(path2)
  ])

  await each(imageFileNames1, async (imageFileName1, index) => {
    const imageFileName2 = imageFileNames2.find(fileName => {
      return path.parse(fileName).base === imageFileName1
    })
    if (!imageFileName2) {
      console.log(`Could not find ${imageFileName1} in ${path2}`)
      return
    }

    const imagePath1 = path.join(path1, imageFileName1)
    const imagePath2 = path.join(path2, imageFileName2)
    const [image1, image2] = await loadImage.all([imagePath1, imagePath2])

    imageEqual(image1, image2, path.join(pathDiff, imageFileName1))
  })
}
