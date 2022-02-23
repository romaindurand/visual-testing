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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  const tempPath = path.join('.visual-testing', 'temp')
  const diffPath = path.join('.visual-testing', 'diff')
  const referencePath = path.join('.visual-testing', 'reference')
  const config = await getConfig()
  const interactive = isInteractive()
  verboseLog({ config })

  const stories = await getStories(page, config)
  verboseLog({ stories })
  await takeScreenshots({
    devices: config.devices,
    stories,
    savePath: tempPath,
    interactive,
    browser,
    delay: config.delay,
  })
  await browser.close()
  console.log(chalk.blue('Chrome instance closed'))
  await compareImages(referencePath, tempPath, diffPath, interactive)
  await displayDiffs(diffPath, interactive, referencePath, tempPath)
}

async function getStories(page, config) {
  const options = config.stories
  const ignoredStories = config.ignored || []
  try {
    await page.goto('http://localhost:6006/iframe.html')
  } catch {
    console.log(chalk.red('Storybook not running'))
    process.exit(1)
  }
  const stories = await page.evaluate(() => {
    let stories
    const sb_6_4_10 =
      window?.__STORYBOOK_CLIENT_API__?.storyStore?.storyIndex?.stories
    const sb_6_3_12 = window?.__STORYBOOK_CLIENT_API__?._storyStore?._stories
    if (sb_6_4_10) {
      stories = Object.values(sb_6_4_10).map((story) => {
        return {
          title: `${story.title}/${story.name}`,
          id: story.id,
        }
      })
    } else if (sb_6_3_12) {
      stories = Object.values(sb_6_3_12).map((story) => {
        return {
          title: `${story.kind}/${story.name}`,
          id: story.id,
        }
      })
    }

    return Object.values(stories)
  })

  return stories
    .filter((s) => {
      return ignoredStories.every((ignorePattern) => {
        return !s.title.startsWith(ignorePattern)
      })
    })
    .map(normalizeStory(options))
}

function normalizeStory(options = {}) {
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
