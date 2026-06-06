import * as THREE from 'three';

export const JAG_AMP = 0.06;  // world units — tear jag amplitude
export const JAG_FREQ = 14.0; // jags per world unit

export interface TearEdgeUniforms {
  uTearY: { value: number };
  uOffsetX: { value: number };
}

/** Fresh, mutable uniform container for a tear-edge material. */
export function makeTearEdgeUniforms(tearY: number): TearEdgeUniforms {
  return {
    uTearY: { value: tearY },
    uOffsetX: { value: 0 },
  };
}

/**
 * Injects a jagged discard band along the tear line into a built-in material.
 * Both halves use complementary discards (same threshold, opposite signs) so
 * the torn edges interlock. Update the returned uniforms each frame for the
 * moving top strip; leave them at defaults for the static body.
 *
 * Pass an existing `uniforms` object (e.g. one owned by a `useRef`) to keep the
 * mutable container outside React's render-derived state; otherwise a fresh one
 * is created and returned.
 */
export function applyTearEdge(
  material: THREE.Material,
  keepTop: boolean,
  tearY: number,
  uniforms: TearEdgeUniforms = makeTearEdgeUniforms(tearY)
): TearEdgeUniforms {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTearY = uniforms.uTearY;
    shader.uniforms.uOffsetX = uniforms.uOffsetX;
    shader.uniforms.uKeepTop = { value: keepTop ? 1.0 : 0.0 };
    shader.uniforms.uJagAmp = { value: JAG_AMP };
    shader.uniforms.uJagFreq = { value: JAG_FREQ };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTearWorldPos;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvTearWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTearWorldPos;
uniform float uTearY;
uniform float uOffsetX;
uniform float uKeepTop;
uniform float uJagAmp;
uniform float uJagFreq;
float tearHash(float n) { return fract(sin(n) * 43758.5453); }
float tearJag(float x) {
  float p = (x - uOffsetX) * uJagFreq;
  float i = floor(p);
  float f = smoothstep(0.0, 1.0, fract(p));
  return mix(tearHash(i), tearHash(i + 1.0), f) - 0.5;
}`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `float jaggedY = uTearY + tearJag(vTearWorldPos.x) * uJagAmp;
if (uKeepTop > 0.5) { if (vTearWorldPos.y < jaggedY) discard; }
else { if (vTearWorldPos.y > jaggedY) discard; }
#include <clipping_planes_fragment>`
      );
  };
  material.needsUpdate = true;
  return uniforms;
}
