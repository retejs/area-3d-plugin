import { DragControls } from './DragControls'
import { DraggableObject3D } from './DraggableObject3D'

export { DragControls, DraggableObject3D }

export function attachDraggableHooks(controls: DragControls) {
  controls.addEventListener('dragstart', (event) => {
    if (event.object instanceof DraggableObject3D) {
      event.object.events.start()
    }
  })
  controls.addEventListener('drag', (event) => {
    if (event.object instanceof DraggableObject3D) {
      const { x, y, z } = event.position

      event.object.events.translate(x, y, z)
    }
  })
  controls.addEventListener('dragend', (event) => {
    if (event.object instanceof DraggableObject3D) {
      event.object.events.drag()
    }
  })
}
