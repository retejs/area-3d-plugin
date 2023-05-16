/* eslint-disable init-declarations */
import { Camera, Euler, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export { OrbitControls }

export type Transform = { position: Vector3, rotation: Euler }

type Check = (current: Transform, previous: Transform | undefined) => Promise<boolean | unknown>
type Updated = (current: Transform, previous: Transform | undefined) => Promise<boolean | unknown>

export function orbitControlsRestrictor(orbit: OrbitControls, camera: Camera, check: Check, updated: Updated) {
  let previous: Transform | undefined
  let previousTarget: Vector3

  // eslint-disable-next-line max-statements
  orbit.addEventListener('change', async () => {
    const position = camera.position.clone()
    const rotation = camera.rotation.clone()

    if (await check({ position, rotation }, previous)) {
      previous = { position, rotation }
      previousTarget = orbit.target.clone()
    } else {
      if (previous && previousTarget) {
        const { position: p, rotation: r } = previous
        const t = previousTarget

        camera.position.fromArray([p.x, p.y, p.z])
        camera.rotation.fromArray([r.x, r.y, r.z])
        orbit.target.fromArray([t.x, t.y, t.z])
      }
      orbit.update()
      await updated({ position, rotation }, previous)
    }
  })
}
