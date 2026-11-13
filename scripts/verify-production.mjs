import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { setTimeout } from 'node:timers/promises'

const reservation = createServer()
reservation.listen(0, '127.0.0.1')
await once(reservation, 'listening')
const port = reservation.address().port
await new Promise((resolve) => reservation.close(resolve))

const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    PORT: String(port),
    HOST: '127.0.0.1',
    AI_GATEWAY_API_KEY: '',
    SLACK_WEBHOOK_URL: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
server.stdout.on('data', (data) => {
  logs += data
})
server.stderr.on('data', (data) => {
  logs += data
})
const exited = once(server, 'exit')
const baseURL = `http://127.0.0.1:${port}`

try {
  let response
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`Production server exited: ${logs}`)
    try {
      response = await fetch(baseURL, { signal: AbortSignal.timeout(5000) })
      break
    } catch {
      await setTimeout(100)
    }
  }
  assert.ok(response, `Production server did not start: ${logs}`)
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.match(html, /How can I tell if I am in labour/)
  assert.match(html, /<textarea/)
  assert.doesNotMatch(logs, /Error|ERR_MODULE_NOT_FOUND/)

  const stylesheet = html.match(/href="([^"]+\.css)"/)
  assert.ok(stylesheet, 'Server-rendered page must include its stylesheet')
  assert.equal((await fetch(new URL(stylesheet[1], baseURL))).status, 200)

  const unavailable = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          id: 'smoke',
          role: 'user',
          parts: [{ type: 'text', text: 'How should my baby sleep?' }],
        },
      ],
    }),
  })
  assert.equal(unavailable.status, 503)
  assert.match(await unavailable.text(), /not configured/)
  console.log(
    'Production smoke check passed: server rendering, CSS, and API configuration handling.',
  )
} catch (error) {
  console.error(logs)
  throw error
} finally {
  server.kill('SIGTERM')
  await exited
}
