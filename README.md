# @h3nr1-d14z/game-core

Engine-agnostic core cho web game — 0 dependencies, ~100 dòng.

- **`createLoop(physics, render)`** — fixed-timestep accumulator 60 Hz: dt clamp
  (tab ẩn không fast-forward), guard chống spiral-of-death, interpolation alpha
  cho màn 120/144 Hz.
- **`input`** — polled keyboard/pointer state, zero allocation mỗi event.

## Install

```sh
npm i @h3nr1-d14z/game-core
```

## Usage

```ts
import { createLoop, input } from '@h3nr1-d14z/game-core'

const loop = createLoop(
  (dt) => world.step(dt), // physics/engine của bạn
  (alpha) => render(alpha), // vẽ, nội suy bằng alpha
)
loop.start()

if (input.key('Space')) fire()
```

## API

| Export | Ý nghĩa |
|---|---|
| `createLoop(physics(dt), render(alpha))` | trả `{ start, stop }`; `render` nhận alpha ∈ (0,1] để nội suy giữa 2 frame physics |
| `input.key(code)` | phím đang giữ? (`e.code`, vd `'Space'`, `'KeyW'`) |
| `input.pointer` | `{ x, y, down }` |

Input là polling — sự kiện rời rạc (click, menu) thì dùng `addEventListener`
trực tiếp.

## Dev

```sh
npm install
npm test
npm run build
```
