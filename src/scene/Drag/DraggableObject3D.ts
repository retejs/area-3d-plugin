import { ObjectHTML } from '../ObjectHTML'

export class DraggableObject3D extends ObjectHTML {
  constructor(element: HTMLElement, public events: {
    start: () => void,
    translate: (x: number, y: number, z: number) => void,
    drag: () => void
  }) {
    super(element)
  }
}
