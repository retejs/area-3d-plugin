import { DragControls, DragStartEvent, DragEvent, DragEndEvent } from './DragControls'
import { DraggableObject3D } from './DraggableObject3D'

export { DragControls, DraggableObject3D }

export function attachDraggableHooks(controls: DragControls) {
  controls.addEventListener('dragstart', (e: any) => {
    const event = e as DragStartEvent

    if (event.object instanceof DraggableObject3D) {
      event.object.events.start()
    }
  })
  controls.addEventListener('drag', (e: any) => {
    const event = e as DragEvent

    if (event.object instanceof DraggableObject3D) {
      const { x, y, z } = event.position

      event.object.events.translate(x, y, z)
    }
  })
  controls.addEventListener('dragend', (e: any) => {
    const event = e as DragEndEvent

    if (event.object instanceof DraggableObject3D) {
      event.object.events.drag()
    }
  })
}
