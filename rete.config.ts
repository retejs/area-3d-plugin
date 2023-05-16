/* eslint-disable @typescript-eslint/naming-convention */
import commonjs from '@rollup/plugin-commonjs'
import { ReteOptions } from 'rete-cli'

export default <ReteOptions>{
  input: 'src/index.ts',
  name: 'Area3DPlugin',
  globals: {
    'rete': 'Rete',
    'rete-area-plugin': 'ReteAreaPlugin',
    'rete-render-utils': 'ReteRenderUtils',
    'three': 'THREE'
  },
  plugins: [commonjs()]
}
