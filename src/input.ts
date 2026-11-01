// Polled input state — query input.key()/input.pointer from anywhere in the
// game loop, zero allocation per event. For discrete actions (click-to-X,
// menu confirm) use addEventListener directly in your wiring instead.
const keys = new Set<string>()

export const input = {
  key: (code: string): boolean => keys.has(code),
  pointer: { x: 0, y: 0, down: false },
}

addEventListener('keydown', (e) => keys.add(e.code))
addEventListener('keyup', (e) => keys.delete(e.code))
addEventListener('blur', () => keys.clear()) // alt-tab while holding a key
addEventListener('pointermove', (e) => {
  input.pointer.x = e.clientX
  input.pointer.y = e.clientY
})
addEventListener('pointerdown', (e) => {
  input.pointer.down = true
  input.pointer.x = e.clientX
  input.pointer.y = e.clientY
})
addEventListener('pointerup', () => {
  input.pointer.down = false
})
