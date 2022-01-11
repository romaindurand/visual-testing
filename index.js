import puppeteer from 'puppeteer'
import chalk from 'chalk'
import path from 'path'
import compareImages from './lib/compareImages.js'
import displayDiffs from './lib/displayDiffs.js'
import takeScreenshots from './lib/takeScreenshots.js'
import { handleGitIgnore } from './lib/initPath.js'
import { getConfig, isInteractive, verboseLog } from './lib/utils.js'

export default async function startTests() {
  await handleGitIgnore()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const tempPath = path.join('.visual-testing', 'temp')
  const diffPath = path.join('.visual-testing', 'diff')
  const currentPath = path.join('.visual-testing', 'current')
  const config = await getConfig()
  const interactive = isInteractive()
  verboseLog({ config })

  const stories = await getStories(page, config.stories)
  await takeScreenshots({
    devices: config.devices,
    stories,
    savePath: tempPath,
    interactive,
    page,
  })
  await compareImages(currentPath, tempPath, diffPath, interactive)
  await displayDiffs(diffPath, interactive, currentPath, tempPath)
  await browser.close()
  console.log(chalk.blue('Chrome instance closed'))
}

const defaultConfig = {
  devices: ['laptop'],
}

async function getStories(page, options = {}) {
  try {
    await page.goto('http://localhost:6006/iframe.html')
  } catch {
    console.log(chalk.red('Storybook not running'))
    process.exit(1)
  }

  const stories = await page.evaluate(() => {
    return Object.values(
      window.__STORYBOOK_CLIENT_API__.storyStore.storyIndex.stories
    )
  })

  return stories.map(normalizeStory(options))
}

function normalizeStory(options) {
  return function normalize(story) {
    const name = story.title
    const storyOptions = options[name] || null
    const normalizedStory = {
      name,
      id: story.id,
    }
    if (options) normalizedStory.options = storyOptions
    return normalizedStory
  }
}
