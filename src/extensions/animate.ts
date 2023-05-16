import { Area3DPlugin } from '..'
import { ExpectSchemes } from '../types'

export function animate<S extends ExpectSchemes, K>(area: Area3DPlugin<S, K>, tick?: (time: number) => void) {
  function render(time: number) {
    if (tick) tick(time)

    area.area.scene.render()
    requestAnimationFrame((t) => render(t))
  }

  render(performance.now())
}
