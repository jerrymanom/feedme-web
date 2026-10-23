// The session token lives in localStorage; storage can be unavailable
// (private mode, blocked cookies), so every access is guarded.
const KEY = 'feedme.session'

export function getToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
  } catch {
    // Without storage the session lasts until the tab closes.
  }
}
