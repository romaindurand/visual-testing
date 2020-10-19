import chalk from 'chalk'
import exitWithError from './exitWithError.js'

export default function normalizeParameters (parameters) {
  console.log({ parameters })
  const normalizedParameters = {}

  // TODO: add name alias to resolution (ex: mobile, tablet, desktop)
  // must work with an Number[] or an Object
  normalizedParameters.resolutions = parameters.resolutions.map(resolution => {
    const [width, height] = resolution.split('x')
    if (width < 400 || height < 417) {
      console.log(chalk.yellow('Warning: Minimum resolution is 400x417'))
      const resizedResolution = `${Math.max(width, 400)}x${Math.max(height, 417)}`
      console.log(chalk.yellow(`resolution ${resolution} will be resized as ${resizedResolution}\n`))
      return resizedResolution
    }
    return resolution
  }) || [800]

  const screenshots = parameters.screenshots
  if (!screenshots || !screenshots.oldPath || !screenshots.newPath || !screenshots.diffPath) {
    exitWithError('screenshots must be an Object({oldPath: String, newPath: String, diffPath: String})')
  }

  // TODO: accept an array of Strings and create name from url
  if (!parameters.urls || !Object.entries(parameters.urls).every(([key, value]) => (typeof key === 'string' && typeof value === 'string'))) {
    exitWithError('urls parameter must be an Object({screenshotName: \'url to capture\', screenshotName2: \'an other url})', parameters.urls)
  }
  normalizedParameters.urls = parameters.urls

  normalizedParameters.screenshots = screenshots

  normalizedParameters.interactive = Boolean(parameters.interactive)

  normalizedParameters.waitForOptions = parameters.waitForOptions || { type: 'timeout', value: 100 }

  console.log({ normalizedParameters })
  return normalizedParameters
}
