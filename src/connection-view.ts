import { ObjectHTML } from './scene/ObjectHTML'

type Events = {
  contextmenu: (event: MouseEvent) => void
}

export class ConnectionView {
  element: HTMLElement
  object: ObjectHTML

  constructor(events: Events) {
    this.element = document.createElement('div')

    this.element.style.position = 'absolute'
    this.element.style.left = '0'
    this.element.style.top = '0'
    this.element.addEventListener('contextmenu', event => events.contextmenu(event))

    this.object = new ObjectHTML(this.element)
  }

  // public update(params?: HTML3DOptions) {
  //   setHTMLElement(this.object, this.element, {
  //     materials: {
  //       front: params?.materials?.front || createMaterial(false),
  //       back: params?.materials?.back || createBackMaterial()
  //     }
  //   })
  // }
}
