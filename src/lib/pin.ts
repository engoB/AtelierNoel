export function hashPin(pin: string): string {
  let hash = 2166136261
  for (const character of `atelier-noel:${pin}`) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}
