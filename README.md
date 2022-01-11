# visual-testing

Automates visual regressions tests for storybook by comparing screenshots.

---

## Description

Storybook must be running beforehand. Using [start-server-and-test](https://www.npmjs.com/package/start-server-and-test) allows for an easy CI integration (see `./demo/package.json`).

---

## CLI

- `--ci` Use for continuous integration. Disable user interaction.
- `--verbose` Display loaded configuration

---

## Configuration

Configuration is done in your `package.json`.

Create a `visual-testing` object.

See `./demo/package.json` for usage example.

- `devices` An array of device names. Each component will generate a screenshot for each device. (available devices: `laptop`, `iphone7`)
- `stories` An object to configure stories individually. Use story name as a key

### Stories options

- `delay` Number (in miliseconds). Wait a specified delay before taking screenshot. Use for components with an enter animation.
