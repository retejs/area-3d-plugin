import { Camera, PCFSoftShadowMap, Scene, WebGLRenderer } from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export class HybridRenderer {
  css3d: CSS3DRenderer
  webgl: WebGLRenderer
  domElement: HTMLElement

  constructor() {
    this.css3d = this.getDefaultCSS3DRenderer()
    this.webgl = this.getDefaultWebGLRenderer()

    this.domElement = document.createElement('div')

    this.css3d.domElement.setAttribute('data-css3d', 'true')

    fillAbsolute(this.domElement)
    fillAbsolute(this.css3d.domElement)
    fillAbsolute(this.webgl.domElement)

    this.domElement.appendChild(this.css3d.domElement)
    this.domElement.appendChild(this.webgl.domElement)

    this.webgl.domElement.style.pointerEvents = 'none'
  }

  getContent() {
    return this.webgl.domElement.firstElementChild
  }

  private getDefaultCSS3DRenderer() {
    const css3d = new CSS3DRenderer()

    return css3d
  }

  private getDefaultWebGLRenderer() {
    const webgl = new WebGLRenderer({ alpha: false, antialias: true })

    webgl.setPixelRatio(window.devicePixelRatio)
    webgl.setClearColor(0xffffff, 0)
    webgl.shadowMap.enabled = true
    webgl.shadowMap.type = PCFSoftShadowMap

    return webgl
  }

  setSize(width: number, height: number) {
    this.css3d.setSize(width, height)
    this.webgl.setSize(width, height)
  }

  render(scene: Scene, camera: Camera) {
    this.css3d.render(scene, camera)
    this.webgl.render(scene, camera)
  }
}

function fillAbsolute(el: HTMLElement) {
  el.style.width = '100%'
  el.style.height = '100%'
  el.style.position = 'absolute'
  el.style.left = '0'
  el.style.top = '0'
}
