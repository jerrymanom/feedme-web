import { useSyncExternalStore } from 'react'

// Tiny hash router: four screens do not justify a routing dependency, and hash
// URLs work on any static host without rewrite rules.
function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useRoute() {
  return useSyncExternalStore(subscribe, currentPath, () => '/')
}

export function navigate(path) {
  window.location.hash = path
}
