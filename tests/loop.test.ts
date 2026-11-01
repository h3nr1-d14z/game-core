import { describe, expect, it, vi } from 'vitest'
import { createLoop } from '../src/loop'

// Harness: capture the rAF callback so tests drive frames with synthetic time.
function harness() {
  let cb: ((t: number) => void) | null = null
  vi.stubGlobal('requestAnimationFrame', (fn: (t: number) => void) => {
    cb = fn
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    cb = null
  })
  return {
    fire: (t: number) => cb?.(t),
  }
}

const STEP_MS = 1000 / 60

describe('createLoop', () => {
  it('advances physics at ~60 steps per simulated second', () => {
    const h = harness()
    const physics = vi.fn()
    const loop = createLoop(physics, () => {})
    loop.start()
    const t0 = performance.now()
    h.fire(t0)
    for (let i = 1; i <= 60; i++) h.fire(t0 + i * STEP_MS)
    const steps = physics.mock.calls.length
    expect(steps).toBeGreaterThanOrEqual(59) // float error at step boundaries
    expect(steps).toBeLessThanOrEqual(61)
    loop.stop()
  })

  it('caps catch-up at 5 substeps and drops the backlog (no spiral of death)', () => {
    const h = harness()
    const physics = vi.fn()
    const loop = createLoop(physics, () => {})
    loop.start()
    const t0 = performance.now()
    h.fire(t0)
    h.fire(t0 + 10_000) // 10s stall: dt clamped to 0.25s → 15 steps wanted, 5 allowed
    expect(physics).toHaveBeenCalledTimes(5)
    loop.stop()
  })

  it('renders with interpolation alpha in (0, 1]', () => {
    const h = harness()
    let lastAlpha = -1
    const loop = createLoop(
      () => {},
      (alpha) => {
        lastAlpha = alpha
      },
    )
    loop.start()
    const t0 = performance.now()
    h.fire(t0)
    h.fire(t0 + STEP_MS / 2) // half a step → alpha ≈ 0.5
    expect(lastAlpha).toBeGreaterThan(0)
    expect(lastAlpha).toBeLessThanOrEqual(1)
    loop.stop()
  })

  it('stop() halts the simulation', () => {
    const h = harness()
    const physics = vi.fn()
    const loop = createLoop(physics, () => {})
    loop.start()
    loop.stop()
    const t0 = performance.now()
    h.fire(t0)
    h.fire(t0 + STEP_MS * 10)
    expect(physics).not.toHaveBeenCalled()
  })
})
