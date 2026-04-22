/**
 * Play a short notification sound for new messages.
 * Uses Web Audio API (no external files needed).
 */
export function playMessageSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // Pleasant two-tone ding (A5 -> C#6)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // Ignore audio errors
  }
}
