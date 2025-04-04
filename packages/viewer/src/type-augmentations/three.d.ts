import { MeshBVH } from 'three-mesh-bvh'

declare module 'three' {
  interface Raycaster {
    firstHitOnly: boolean
  }
  interface BufferGeometry {
    boundsTree: MeshBVH
  }

  interface WebGLMultipleRenderTargets {
    width: number
    height: number
  }
}
export {}
