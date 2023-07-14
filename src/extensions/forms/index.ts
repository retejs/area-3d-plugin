/**
 * Group of functions to replicate forms.
 * This extension provides a functions for generating geometry that replicates the form of HTML elements embedded in the scene.
 * @module Extensions/Forms
 */
export { comment } from './comment'
export type { Props as ConnectionForm } from './connection'
export { connection, createClassicConnectionGeometry } from './connection'
export type { Props as NodeForm } from './node'
export { createClassicNodeGeometry, node } from './node'
export type { Params as ClassicNodeOptions } from './node/geometry'
export { reroute } from './reroute'
