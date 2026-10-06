export function createLocalId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  const randomPart = Math.random().toString(36).slice(2)
  return `local-${Date.now().toString(36)}-${randomPart}`
}
