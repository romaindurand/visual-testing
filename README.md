# visual-testing

Simply test visual regressions for your pages or components.

## Usage

```js
import startTests from 'visual-testing'

startTests({
  resolutions: {mobile: 400, tablet: 500, desktop: 800},
  urls: { google: 'https://google.com' },
  screenshots: { oldPath, newPath, diffPath },
  interactive: true
})
```