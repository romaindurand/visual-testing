import { promises as fs } from 'fs'
import path from 'path'
import open from 'open'
import each from 'p-each-series'

export default async function displayDiffs (diffPath, interactive) {
  const diffFiles = await fs.readdir(diffPath)
  each(diffFiles, async diffFile => {
    await open(path.join(diffPath, diffFile), {
      wait: true,
      app: 'photos'
    })
    console.log('image preview closed')
  })
}
