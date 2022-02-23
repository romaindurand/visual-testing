const { promises: fs } = require('fs')
const path = require('path')
const fastify = require('fastify')
const fastifyStatic = require('fastify-static')

async function serveDiffUi(visualTestingDir, port = 4444) {
  console.log({ visualTestingDir })
  const referencePath = path.join(visualTestingDir, 'reference')
  const tempPath = path.join(visualTestingDir, 'temp')
  const diffPath = path.join(visualTestingDir, 'diff')
  const server = fastify({ logger: true })

  server.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
  })

  server.register(fastifyStatic, {
    root: visualTestingDir,
    prefix: '/images',
    decorateReply: false,
  })

  server.get('/api/diffs', async (request, reply) => {
    console.log({ __dirname })
    const diffFolder = path.resolve('./.visual-testing/diff')
    const files = await fs.readdir(diffFolder)
    console.log({ files })

    return files.map((f) => ({ name: f }))
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
  return server.close
}

module.exports = serveDiffUi
