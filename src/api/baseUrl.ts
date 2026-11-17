// API address from VITE_API_BASE_URL. If it points at localhost but the app was
// opened from another device (e.g. http://192.168.1.20:5173 on a phone), use the
// same host the page came from, since "localhost" there would be the phone itself.
const resolveBaseUrl = () => {
  const configured: string | undefined = import.meta.env.VITE_API_BASE_URL
  if (!configured) return ''
  try {
    const url = new URL(configured)
    const local = ['localhost', '127.0.0.1']
    if (
      local.includes(url.hostname) &&
      !local.includes(window.location.hostname)
    ) {
      url.hostname = window.location.hostname
    }
    return url.origin + url.pathname.replace(/\/$/, '')
  } catch {
    return configured
  }
}

export const baseUrl = resolveBaseUrl()
