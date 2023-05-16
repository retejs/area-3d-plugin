import { BaseSchemes, GetSchemes } from 'rete'

export type Position = { x: number, y: number }
export type Vector3D = { x: number, y: number, z: number }
export type Size = { width: number, height: number }

export type GetRenderTypes<Signals> = Extract<
  Signals,
  { type: 'render', data: any }
> extends { type: 'render', data: { type: infer G } } ? (G extends string ? G : string) : string

export type ExpectSchemes = GetSchemes<BaseSchemes['Node'] & Size, BaseSchemes['Connection']>
