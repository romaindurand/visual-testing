# visual-testing

Automates visual regressions tests for storybook by comparing screenshots.

---

## Description

Storybook must be running beforehand. Using [start-server-and-test](https://www.npmjs.com/package/start-server-and-test) allows for an easy CI integration (see `./demo/package.json`).

---

## CLI

- `--ci` Use for continuous integration. Disable user interaction.
- `--verbose` Logs configuration informations and stories

---

## Configuration

Configuration can be written in 2 ways :

- in your `package.json` using a `"visual-testing"` key
- in a `visual-testing.json` file.

Create a `visual-testing` object.

See `./demo/package.json` for usage example.

- `devices` An array of device names. Each component will generate a screenshot for each device. (available devices: `laptop`, `iphone7`)
- `stories` An object to configure stories individually. Use story name as a key
- `ignored` An array of story names. Use to ignore specific stories. Story names will also match as a starting pattern. Ex : `foo` will match for stories `foo/bar` and `foo/baz`

### Stories options

- `delay` Number (in miliseconds). Wait a specified delay before taking screenshot. Use for components with an enter animation.
