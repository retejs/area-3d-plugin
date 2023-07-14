import { Area3DPlugin } from '..'
import { ExpectSchemes } from '../types'

/**
 * Animate the given 3D scene, uses `requestAnimationFrame`
 * @param area The 3D area plugin
 * @param tick Optional callback to be called on each frame
 * @example Area3DExtensions.animate(area)
 * @example Area3DExtensions.animate(area, time => console.log(time))
 */
export function animate<S extends ExpectSchemes, K>(area: Area3DPlugin<S, K>, tick?: (time: number) => void) {
  function render(time: number) {
    if (tick) tick(time)

    area.area.scene.render()
    requestAnimationFrame((t) => render(t))
  }

  render(performance.now())
}
