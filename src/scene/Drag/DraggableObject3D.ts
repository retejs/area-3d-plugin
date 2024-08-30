import { ObjectHTML } from '../ObjectHTML'

export class DraggableObject3D extends ObjectHTML {
  constructor(element: HTMLElement, public events: {
    start: () => void
    translate: (x: number, y: number, z: number) => unknown
    drag: () => void
  }) {
    super(element)
  }
}
