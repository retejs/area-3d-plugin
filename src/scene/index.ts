import {
  Object3D, PerspectiveCamera, Plane,
  Raycaster, Scene, Vector2, Vector3
} from 'three'

import { attachDraggableHooks, DragControls, DraggableObject3D } from './Drag'
import { HybridRenderer } from './HybridRenderer'
import { OrbitControls } from './OrbitControls'

export { DraggableObject3D }

/**
 * HybridScene is a wrapper for Three.js Scene with some additional features such as:
 * - drag controls
 * - orbit controls
 * - camera
 * - renderer
 */
export class HybridScene<Scope> {
  camera: PerspectiveCamera
  renderer: HybridRenderer
  root = new Scene()
  canvases = new Map<Scope, Object3D>()
  controls: DragControls
  orbit: OrbitControls

  constructor(private container: HTMLElement) {
    this.camera = new PerspectiveCamera()
    this.camera.position.set(0, 0, 1000)
    this.camera.fov = 45
    this.camera.near = 1
    this.camera.far = 4000

    this.renderer = new HybridRenderer()

    container.appendChild(this.renderer.domElement)

    this.orbit = this.createOrbitControls()
    this.controls = this.createDragControls(this.orbit)
  }

  private createOrbitControls() {
    const orbit = new OrbitControls(this.camera, this.renderer.domElement)

    orbit.update()

    let orbitChangeNumber = 0

    orbit.addEventListener('start', () => {
      orbitChangeNumber = 0
    })

    orbit.addEventListener('change', () => {
      orbitChangeNumber++
    })

    this.renderer.domElement.addEventListener('contextmenu', e => {
      if (orbitChangeNumber > 5) e.stopPropagation()
    })

    return orbit
  }

  private createDragControls(orbit: OrbitControls) {
    const controls = new DragControls(
      this.camera,
      this.renderer.domElement,
      (object) => {
        const canvas = object.parent

        if (!canvas) throw new Error('object doesnt have parent')
        if (!Array.from(this.canvases.values()).includes(canvas)) throw new Error('object parent isnt canvas')

        return this.canvasToPlane(canvas)
      }
    )

    attachDraggableHooks(controls)

    controls.addEventListener('dragstart', () => orbit.enabled = false)
    controls.addEventListener('dragend', () => orbit.enabled = true)

    return controls
  }

  canvasToPlane(canvas: Object3D) {
    const plane = new Plane()
    const normal = new Vector3(0, 0, 1)

    normal.applyQuaternion(canvas.quaternion)
    plane.setFromNormalAndCoplanarPoint(normal, canvas.position.clone())

    return plane
  }

  addCanvasFor(scope: Scope) {
    const canvas = new Object3D()

    canvas.scale.set(1, -1, 1)
    this.canvases.set(scope, canvas)
    this.root.add(canvas)
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * Render the frame. Can be directly used instead of `animate` extension.
   */
  public render() {
    this.renderer.render(this.root, this.camera)
  }

  private getCanvasFor(scope: Scope) {
    const canvas = this.canvases.get(scope)

    if (!canvas) throw new Error('cannot find canvas for the scope')

    return canvas
  }

  add(object: Object3D, scope: Scope) {
    object.scale.set(1, -1, 1)
    this.getCanvasFor(scope).add(object)
    if (object instanceof DraggableObject3D) this.controls.attach(object)
    this.render() // force DOM elements to be rendered synchronously
  }

  remove(object: Object3D, scope: Scope) {
    this.getCanvasFor(scope).remove(object)
    if (object instanceof DraggableObject3D) this.controls.detach(object)
    this.render() // force DOM elements to be rendered synchronously
  }

  public getPointerFrom(event: MouseEvent, scope: Scope) {
    const rect = this.container.getBoundingClientRect()
    const raycaster = new Raycaster()
    const pointer = new Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      - (event.clientY - rect.top) / rect.height * 2 + 1
    )

    raycaster.setFromCamera(pointer, this.camera)

    const canvas = this.getCanvasFor(scope)
    const plane = this.canvasToPlane(canvas)

    const intersection = raycaster.ray.intersectPlane(plane, new Vector3())

    if (intersection) {
      return canvas.worldToLocal(intersection)
    }
    return null
  }
}
