---
name: check-logs
description: Read and analyze the Release Hub API's structured runtime logs without flooding context. Use when the user asks to "check the logs", "check the API logs", "why did <operation> fail", "what errors happened", "look at the backend logs", or wants to debug runtime behavior from logs. Routes raw log bytes through context-mode so only the derived answer enters the conversation.
---

# Check Logs

The NestJS API writes structured JSON-Lines logs (one JSON object per line) to a stable file. Each line carries `level` (string label), `time` (ISO), `reqId`, plus operation logs with `operation`, `operationType`, `userId`, `durationMs`, and `err` (with stack) on failures. Secrets are already redacted at write time.

## Log locations

- **API (structured JSONL):** `apps/api/logs/app.jsonl` — the primary source. Query this first.
- **Web + combined dev output (plain text):** `logs/dev.log` (only present when the app was started with `pnpm dev:log`). Use for Vite/HMR/frontend build errors.

## How to read them (keep context clean)

NEVER `cat`/`Read` these files directly — they can be huge. Always process them in the context-mode sandbox so only the derived answer returns:

1. Use `mcp__plugin_context-mode_context-mode__ctx_execute_file` (or `ctx_batch_execute`) to run shell/node over the file.
2. Filter to what the user asked: by `level`, by `operation`, by time window, or by `reqId` to trace one request.
3. Return a concise summary: counts by error type, the offending operations, the relevant stack — not the raw lines.

## Useful one-liners (run inside context-mode, not Bash)

- Recent errors: `grep -F '"level":"error"' apps/api/logs/app.jsonl | tail -n 50`
- Count errors by operation: `grep -F '"level":"error"' apps/api/logs/app.jsonl | node -e "let n={};require('readline').createInterface({input:process.stdin}).on('line',l=>{try{const o=JSON.parse(l);n[o.operation]=(n[o.operation]||0)+1}catch{}}).on('close',()=>console.log(n))"`
- Trace one request: `grep -F '"reqId":"<id>"' apps/api/logs/app.jsonl`
- Slowest operations: parse `durationMs` and sort.

## If the file is missing

The API only writes it while running. Tell the user to start it with `pnpm dev` (structured file + pretty console) or `pnpm dev:log` (also captures web output to `logs/dev.log`).
