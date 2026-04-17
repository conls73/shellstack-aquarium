const ELECTRON_URL = 'http://localhost:47392/notifications'

function extractCount(title) {
  const match = title.match(/\((\d+)\)/)
  return match ? parseInt(match[1], 10) : 0
}

function getSource(url) {
  if (!url) return null
  if (url.includes('mail.google.com')) return 'gmail'
  if (url.includes('slack.com')) return 'slack'
  return null
}

async function sendToElectron(source, count) {
  try {
    await fetch(ELECTRON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, count })
    })
  } catch {
    // Electron app not running — store for when it starts
  }
  chrome.storage.local.set({ [source]: count })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const title = changeInfo.title || tab.title || ''
  const source = getSource(tab.url)
  if (!source || !title) return

  const count = extractCount(title)
  sendToElectron(source, count)
})

// On startup, scan all open tabs
chrome.runtime.onStartup.addListener(async () => {
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    const source = getSource(tab.url)
    if (source && tab.title) {
      sendToElectron(source, extractCount(tab.title))
    }
  }
})
