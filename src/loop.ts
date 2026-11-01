const STEP = 1 / 60 // physics rate; keep the engine's timestep in sync
const MAX_SUBSTEPS = 5 // slow machine: simulate at most 5 steps, drop the rest
const DT_CLAMP = 0.25 // tab was hidden / long stall: never fast-forward physics

export interface Loop {
  start(): void
  stop(): void
}

// Fixed-timestep accumulator (Glazer loop): determinism + stability for physics,
// render runs once per rAF with the leftover fraction as interpolation alpha.
// Engine-agnostic: physics(dt) is whatever the game's engine needs (Rapier 3D,
// Rapier 2D, nothing at all for pure logic games).
export function createLoop(
  physics: (dt: number) => void,
  render: (alpha: number) => void,
): Loop {
  let raf = 0
  let last = performance.now()
  let acc = 0
  let running = false

  function frame(now: number): void {
    if (!running) return
    raf = requestAnimationFrame(frame)

    const dt = Math.min((now - last) / 1000, DT_CLAMP)
    last = now
    acc += dt

    let steps = 0
    while (acc >= STEP && steps < MAX_SUBSTEPS) {
      physics(STEP)
      acc -= STEP
      steps++
    }
    if (acc > STEP) acc = 0 // spiral-of-death guard: drop backlog instead of compounding

    render(Math.min(acc / STEP, 1))
  }

  return {
    start() {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
  }
}
