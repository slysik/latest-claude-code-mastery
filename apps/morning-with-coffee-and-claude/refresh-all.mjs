#!/usr/bin/env node
// refresh-all.mjs — Trigger all 3 briefing slots against running dev server
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env like Next.js does
function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try {
      const content = readFileSync(resolve(__dirname, f), 'utf-8')
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (match) {
          let val = match[2] || ''
          val = val.replace(/^['"]|['"]$/g, '')
          if (!process.env[match[1]]) process.env[match[1]] = val
        }
      }
    } catch { /* file not found, skip */ }
  }
}

loadEnv()

const PORT = process.env.PORT || 3000
const BASE = `http://localhost:${PORT}`
const SECRET = process.env.CRON_SECRET

if (!SECRET) {
  console.error('ERROR: CRON_SECRET not found in env files')
  process.exit(1)
}

console.log(`Using CRON_SECRET: ${SECRET.slice(0, 4)}...${SECRET.slice(-4)}`)

for (const slot of ['morning', 'midday', 'evening']) {
  console.log(`\n==> Triggering ${slot} briefing...`)
  try {
    const res = await fetch(`${BASE}/api/cron/aggregate?slot=${slot}&force=true`, {
      headers: { 'Authorization': `Bearer ${SECRET}` },
    })
    const data = await res.json()
    if (res.ok) {
      console.log(`    OK: ${data.totalItems} items, tldr=${data.tldrGenerated}, ${data.durationMs}ms`)
      if (data.errors?.length) console.log(`    Warnings: ${data.errors.join(', ')}`)
    } else {
      console.log(`    FAILED (${res.status}): ${JSON.stringify(data)}`)
    }
  } catch (err) {
    console.log(`    ERROR: ${err.message}`)
  }
}

console.log(`\n==> Done! Visit ${BASE}`)
