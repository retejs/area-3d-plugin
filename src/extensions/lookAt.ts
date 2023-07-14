import { PerspectiveCamera, Vector3 } from 'three'

import { Area3DPlugin } from '..'
import { ExpectSchemes } from '../types'
import { getBoundingBox } from './bounding-box'

/**
 * Parameters for `zoomAt` extension
 */
export type Params = {
  /** Set gap between nodes and the viewport border */
  scale?: number
}

/**
 * Move the camera to look at the given nodes
 * @param area The 3D area plugin
 * @param nodes The nodes to look at
 * @param params The lookAt parameters
 * @example Area3DExtensions.lookAt(area, [node1, node2])
 * @example Area3DExtensions.lookAt(area, [node1, node2], { scale: 0.8 })
 */
export function lookAt<S extends ExpectSchemes, K>(area: Area3DPlugin<S, K>, nodes: S['Node'][], params?: Params) {
  const { scale = 0.9 } = params || {}
  const { scene } = area.area
  const { camera, orbit, canvases } = scene
  const canvas = canvases.get(area)
  const bbox = getBoundingBox(area, nodes)

  if (!canvas) throw new Error('cannot found canvas')

  const distance = getTargetDistance(camera, area.container, bbox, scale)
  const target = new Vector3(bbox.center.x, bbox.center.y, 0)
  const source = target.clone().add(new Vector3(0, 0, distance))

  canvas.localToWorld(target)
  canvas.localToWorld(source)

  camera.position.copy(source)
  orbit.target.copy(target)
  orbit.update()
}

function getTargetDistance(camera: PerspectiveCamera, container: HTMLElement, size: { width: number, height: number }, scale: number) {
  const fov = camera.fov * (Math.PI / 180)
  const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect)
  const dx = Math.abs(size.width / 2 / Math.tan(fovh / 2))
  const dy = Math.abs(size.height / 2 / Math.tan(fov / 2))
  const minDistance = Math.abs(container.clientHeight / 2 / Math.tan(fov / 2))
  const distance = Math.max(dx, dy, minDistance)

  return distance / scale
}
