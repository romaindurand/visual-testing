const { promises: fs } = require('fs')
const path = require('path')
const fastify = require('fastify')
const fastifyStatic = require('fastify-static')
const chalk = require('chalk')

async function serveDiffUi(visualTestingDir, port = 4444) {
  const referencePath = path.join(visualTestingDir, 'reference')
  const tempPath = path.join(visualTestingDir, 'temp')
  const diffPath = path.join(visualTestingDir, 'diff')
  const server = fastify()

  server.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
  })

  server.register(fastifyStatic, {
    root: visualTestingDir,
    prefix: '/images',
    decorateReply: false,
  })

  server.get('/api/diffs', async (request, reply) => {
    const diffs = await getDiffs()
    if (diffs.length === 0) {
      console.log(chalk.green('no diffs left'))
      setTimeout(server.close, 1000)
      return []
    }
    return diffs
  })

  server.get('/api/accept', async (request) => {
    const { name } = request.query
    const referenceFile = path.join(referencePath, name)
    const tempFile = path.join(tempPath, name)
    const diffFile = path.join(diffPath, name)

    await fs.rename(tempFile, referenceFile)
    await fs.unlink(diffFile)

    return { message: 'ok' }
  })

  server.get('/api/reject', async (request) => {
    const { name } = request.query
    const tempFile = path.join(tempPath, name)
    const diffFile = path.join(diffPath, name)

    await fs.unlink(diffFile)
    await fs.unlink(tempFile)

    return { message: 'ok' }
  })

  const start = async () => {
    try {
      await server.listen(port)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }
  await start()
}

async function getDiffs() {
  const diffFolder = path.resolve('./.visual-testing/diff')
  const files = await fs.readdir(diffFolder)

  return files.map((f) => ({ name: f }))
}

module.exports = serveDiffUi
