export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true

  return isStandalone || isIOSStandalone
}

export function isPWAInstalled(): boolean {
  return isStandalonePWA()
}

export function getBrowserUrl(): string {
  if (typeof window === "undefined") return ""
  return window.location.href
}

export function openInBrowser(url?: string): void {
  const targetUrl = url || window.location.href

  if (isStandalonePWA()) {
    window.open(targetUrl, "_blank")
  } else {
    window.location.href = targetUrl
  }
}
