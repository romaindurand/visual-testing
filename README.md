# visual-testing

Automates your visual regressions tests for your components or pages by comparing screenshots.

___
## Description
Components/pages are listed using an url. They are captured in every given resolution.

You can use a storybook (dev mode or static build) preview url.

---
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
---
## API

`startTests` is a function. It returns a promise that resolves when tests are done.

### resolutions
A list of device width (in px) used to capture each url.

Default: `[800]`

Example:
```js
[400, 800, 1280]
```

An object can be used to give each device width an alias.

Example: 
```js
{
  mobile: 400,
  desktop: 1280
}
```

### urls
An object to list all urls to be tested. Keys are used as aliases.

Default: `{}`

Example:
```js
{
  HomepageTitle: 'http://localhost:8080/HomepageTitle.html',
  Footer: 'http://localhost:8080/Footer.html',
  ...
}
```

### screenshots

### interactive