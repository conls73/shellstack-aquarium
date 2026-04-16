import express from 'express'
import http from 'http'

interface OAuthServerResult {
  port: number
  code: Promise<string>
}

export function startOAuthServer(callbackPath: string): OAuthServerResult {
  const app = express()
  let server: http.Server
  let resolveCode: (code: string) => void
  let rejectCode: (err: Error) => void

  const code = new Promise<string>((res, rej) => {
    resolveCode = res
    rejectCode = rej
  })

  app.get(callbackPath, (req, res) => {
    const authCode = req.query.code as string | undefined
    const error = req.query.error as string | undefined

    if (authCode) {
      res.send('<html><body style="font-family:sans-serif;background:#0a1628;color:#88ccff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h2>✓ Connected! You can close this window.</h2></body></html>')
      resolveCode(authCode)
    } else {
      res.send('<html><body style="font-family:sans-serif;background:#0a1628;color:#ff6666;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h2>✗ Authorization failed. Please try again.</h2></body></html>')
      rejectCode(new Error(error ?? 'Authorization denied'))
    }

    setTimeout(() => server.close(), 500)
  })

  server = app.listen(0) // OS-assigned random port
  const port = (server.address() as { port: number }).port

  return { port, code }
}
