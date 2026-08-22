// StayNest test suite runner — executes all backend tests sequentially.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const testFiles = [
  'auth.test.mjs',
  'account.test.mjs',
  'hotel.test.mjs',
  'booking.test.mjs',
  'reviews.test.mjs',
  'saved.test.mjs',
  'admin.test.mjs',
]

console.log('====================================================')
console.log('       STAYNEST COMPLETE TEST SUITE RUNNER         ')
console.log('====================================================\n')

let passedSuites = 0
let failedSuites = 0

for (const file of testFiles) {
  const fullPath = join(__dirname, file)
  console.log(`\n>>> RUNNING: ${file}`)

  const code = await new Promise((resolve) => {
    const proc = spawn('node', [fullPath], { stdio: 'inherit' })
    proc.on('close', resolve)
  })

  if (code === 0) {
    passedSuites += 1
  } else {
    failedSuites += 1
  }
}

console.log('\n====================================================')
console.log(`SUMMARY: ${passedSuites} test suites passed, ${failedSuites} failed`)
console.log('====================================================\n')

process.exit(failedSuites > 0 ? 1 : 0)
