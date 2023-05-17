import { BufferGeometry } from 'three'

import { HybridScene } from './scene'
import { ObjectHTML, ObjectHTMLMaterials } from './scene/ObjectHTML'

export class Content<Scope> {
  public holder: HTMLElement
  public objects = new WeakMap<HTMLElement, ObjectHTML>()

  constructor(private scene: HybridScene<Scope>, private scope: Scope, private reordered: (target: HTMLElement) => Promise<unknown>) {
    const css3dContainer = scene.renderer.css3d.domElement.firstElementChild?.firstElementChild

    if (!css3dContainer || !(css3dContainer instanceof HTMLElement)) {
      throw new Error('cannot find container for css3d element')
    }

    this.holder = css3dContainer
  }

  public getPointerFrom(event: MouseEvent) {
    const { left, top } = this.holder.getBoundingClientRect()
    const x = event.clientX - left
    const y = event.clientY - top

    return { x, y }
  }

  add(element: HTMLElement, object = new ObjectHTML(element)) {
    this.objects.set(element, object)
    this.holder.appendChild(element)
    this.scene.add(object, this.scope)
  }

  // eslint-disable-next-line no-undef
  async reorder(target: HTMLElement, next: ChildNode | null) {
    if (!this.holder.contains(target)) {
      throw new Error(`content doesn't have 'target' for reordering`)
    }
    if (next !== null && !this.holder.contains(next)) {
      throw new Error(`content doesn't have 'next' for reordering`)
    }

    this.holder.insertBefore(target, next)
    await this.reordered(target)
  }

  remove(element: HTMLElement) {
    const object = this.objects.get(element)

    if (object) {
      this.objects.delete(element)
      this.scene.remove(object, this.scope)
    }
  }

  updateGeometry(element: HTMLElement, geometry?: BufferGeometry | ((old?: BufferGeometry) => BufferGeometry | undefined)) {
    const object = this.objects.get(element)

    if (object) {
      object.updateGeometry(typeof geometry === 'function' ? geometry(object.front.geometry) : geometry)
    }
  }

  updateMaterials(element: HTMLElement, materials?: ObjectHTMLMaterials) {
    const object = this.objects.get(element)

    if (object) object.updateMaterials(materials)
  }
}
