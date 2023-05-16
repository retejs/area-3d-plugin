import {
  BackSide, BufferGeometry, FrontSide, Material,
  Mesh, MeshBasicMaterial, NoBlending, Object3D, ShadowMaterial
} from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

import { flipFaces } from '../utils/geometry'

export function createMaterial(transparent: boolean) {
  return new ShadowMaterial({
    transparent: true,
    opacity: transparent ? 0.5 : 0.7,
    blending: NoBlending,
    side: FrontSide
  })
}

export function createBackMaterial() {
  return new MeshBasicMaterial({
    color: 0x6e88ff,
    side: BackSide
  })
}

export type ObjectHTMLMaterials = {
  front?: Material
  back?: Material
}

export class ObjectHTML extends Object3D {
  css3dObject: CSS3DObject
  front: Mesh
  back: Mesh

  constructor(element: HTMLElement) {
    super()
    this.css3dObject = new CSS3DObject(element)
    this.css3dObject.onAfterRender = () => {
      const internalTranslate = ' translate(50%, 50%)'

      if (!element.style.transform.endsWith(internalTranslate)) {
        element.style.transform += internalTranslate
      }
    }
    this.add(this.css3dObject)

    const front = new Mesh()

    front.castShadow = true
    front.receiveShadow = true
    this.front = front
    this.add(front)

    const back = new Mesh()

    this.back = back
    this.add(back)

    this.updateMaterials()
  }

  updateGeometry(geometry?: BufferGeometry) {
    const scaled = geometry?.clone().scale(1, -1, 1)

    if (scaled) flipFaces(scaled)

    if (this.front) this.front.geometry = scaled || new BufferGeometry()
    if (this.back) this.back.geometry = scaled || new BufferGeometry()
  }

  updateMaterials(materials?: ObjectHTMLMaterials) {
    if (this.front) this.front.material = materials?.front || createMaterial(false)
    if (this.back) this.back.material = materials?.back || createBackMaterial()
  }
}

export function findTop(objects: ObjectHTML[]) {
  objects.sort((a, b) => {
    if (!a.css3dObject || !b.css3dObject) return 0
    const position = a.css3dObject.element.compareDocumentPosition(b.css3dObject.element)

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return 1
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return -1
    }
    return 0
  })

  return objects[0]
}
