import {
  Camera, EventDispatcher, Intersection, Matrix4,
  Object3D, Plane, Raycaster, Vector2, Vector3
} from 'three'

import { findTop, ObjectHTML } from '../ObjectHTML'

type DefaultObject3D = Object3D
export type DragStartEvent = { type: 'dragstart', object: DefaultObject3D }
export type DragEvent = { type: 'drag', object: DefaultObject3D, position: Vector3 }
export type DragEndEvent = { type: 'dragend', object: DefaultObject3D }

const raycaster = new Raycaster()

// EventDispatcher should have default generic for three 152-156 compatibility
class DragControls extends EventDispatcher {
  enabled = true
  intersections: Intersection<ObjectHTML>[] = []
  selected: Object3D | null = null
  hovered: Object3D | null = null
  objects = new Set<DefaultObject3D>()

  private pointer = new Vector2()
  private offset = new Vector3()
  private intersection = new Vector3()
  private worldPosition = new Vector3()
  private inverseMatrix = new Matrix4()

  constructor(private camera: Camera, private domElement: HTMLElement, private getPlane: (object: Object3D) => Plane) {
    super()

    this.domElement.style.touchAction = 'none' // disable touch scroll
    this.activate()
  }

  attach(object: Object3D) {
    this.objects.add(object)
  }

  detach(object: Object3D) {
    this.objects.delete(object)
  }

  activate() {
    this.domElement.addEventListener('pointermove', this.onPointerMove)
    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointerup', this.onPointerCancel)
    this.domElement.addEventListener('pointerleave', this.onPointerCancel)
  }

  deactivate() {
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointerup', this.onPointerCancel)
    this.domElement.removeEventListener('pointerleave', this.onPointerCancel)

    this.domElement.style.cursor = ''
  }

  dispose() {
    this.deactivate()
  }

  getObjects(): Object3D[] {
    return Array.from(this.objects.values())
  }

  getRaycaster() {
    return raycaster
  }

  onPointerMove = (event: PointerEvent) => {
    if (this.enabled === false) return

    this.updatePointer(event)

    raycaster.setFromCamera(this.pointer, this.camera)

    if (this.selected) {
      if (raycaster.ray.intersectPlane(this.getPlane(this.selected), this.intersection)) {
        const newPosition = this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix)

        const eventData: DragEvent = { type: 'drag', object: this.selected, position: newPosition }

        this.dispatchEvent(eventData as never)
      }
    }
  }

  findContainer(intersection: Intersection<ObjectHTML>) {
    let object: ObjectHTML | null = null
    const objects = this.getObjects()

    intersection.object.traverseAncestors(intersectedObject => {
      if (objects.includes(intersectedObject) && intersectedObject instanceof ObjectHTML) object = intersectedObject
    })
    if (!object) throw new Error('cannot find Object3D')

    return object
  }

  findIntersectedObject(intersections: Intersection<ObjectHTML>[]) {
    return findTop(intersections.map(i => this.findContainer(i)))
  }

  onPointerDown = (event: MouseEvent) => {
    if (this.enabled === false) return

    this.updatePointer(event)

    this.intersections.length = 0

    raycaster.setFromCamera(this.pointer, this.camera)
    this.intersections = raycaster.intersectObjects(this.getObjects(), true)

    if (this.intersections.length > 0) {
      this.selected = this.findIntersectedObject(this.intersections) || null

      if (!this.selected) return
      if (!this.selected.parent) throw new Error('parent required for selected object')

      if (raycaster.ray.intersectPlane(this.getPlane(this.selected), this.intersection)) {
        this.inverseMatrix.copy(this.selected.parent.matrixWorld).invert()
        this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld))
      }

      event.stopPropagation()
      this.domElement.style.cursor = 'move'

      const eventData: DragStartEvent = { type: 'dragstart', object: this.selected }

      this.dispatchEvent(eventData as never)
    }
  }

  onPointerCancel = () => {
    if (this.enabled === false) return

    if (this.selected) {
      const eventData: DragEndEvent = { type: 'dragend', object: this.selected }

      this.dispatchEvent(eventData as never)

      this.selected = null
    }

    this.domElement.style.cursor = this.hovered ? 'pointer' : 'auto'
  }

  updatePointer = (event: MouseEvent) => {
    const rect = this.domElement.getBoundingClientRect()

    this.pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1
    this.pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1
  }
}

export { DragControls }
