/**
 * Triplanar (box) mapping material — projects textures from world-space
 * coordinates instead of UV coordinates. Gives consistent texel density
 * regardless of mesh size or orientation. No stretching on any face.
 */

import { MeshStandardMaterial, Texture } from 'three'

// ── Vertex shader patches ──────────────────────────────────────────────────

const VERT_HEADER = /* glsl */ `
  varying vec3 vTriWorldPos;
  varying vec3 vTriWorldNormal;
`

const VERT_BODY = /* glsl */ `
  vTriWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vTriWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
`

// ── Fragment shader patches ────────────────────────────────────────────────

const FRAG_HEADER = /* glsl */ `
  varying vec3 vTriWorldPos;
  varying vec3 vTriWorldNormal;
  uniform float uTriTileScale;
`

// Replaces #include <map_fragment> — triplanar sampling from 3 axes
const FRAG_MAP = /* glsl */ `
  #ifdef USE_MAP
    // Blend weights from world-space normal — pow(4) sharpens transitions
    vec3 bf = abs(vTriWorldNormal);
    bf = pow(bf, vec3(4.0));
    bf /= (bf.x + bf.y + bf.z);

    // Sample texture from each axis projection
    vec4 cx = texture2D(map, vTriWorldPos.yz * uTriTileScale);
    vec4 cy = texture2D(map, vTriWorldPos.xz * uTriTileScale);
    vec4 cz = texture2D(map, vTriWorldPos.xy * uTriTileScale);

    // Blend
    vec4 sampledDiffuseColor = cx * bf.x + cy * bf.y + cz * bf.z;
    diffuseColor *= sampledDiffuseColor;
  #endif
`

// ── Factory ────────────────────────────────────────────────────────────────

export interface TriplanarParams {
  color?: string
  roughness?: number
  metalness?: number
  envMapIntensity?: number
  map?: Texture | null
}

/**
 * Create a MeshStandardMaterial with triplanar texture projection.
 *
 * @param params  Standard material properties
 * @param tileScale  World-space tile density (e.g. 0.5 = one tile every 2m)
 */
export function createTriplanarMaterial(
  params: TriplanarParams,
  tileScale: number,
): MeshStandardMaterial {
  const mat = new MeshStandardMaterial(params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mat.onBeforeCompile = (shader: any) => {
    shader.uniforms.uTriTileScale = { value: tileScale }

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_HEADER)
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n' + VERT_BODY)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG_HEADER)
      .replace('#include <map_fragment>', FRAG_MAP)
  }

  // All triplanar materials share the same compiled shader program
  mat.customProgramCacheKey = () => 'triplanar-standard'

  return mat
}
