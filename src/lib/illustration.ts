const ART_SLOTS = 8

export function illustrationSrc(phraseId: string): string {
  const dash = phraseId.lastIndexOf('-')
  const prefix = dash === -1 ? 'greet' : phraseId.slice(0, dash)
  const n = Number(phraseId.slice(dash + 1))
  const slot = Number.isFinite(n) && n > 0 ? ((n - 1) % ART_SLOTS) + 1 : 1
  return `/illustrations/${prefix}-${slot}.jpg`
}
