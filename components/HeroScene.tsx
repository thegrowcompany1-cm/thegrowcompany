"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, MutableRefObject } from "react";
import * as THREE from "three";

// ── Shaders ────────────────────────────────────────────────────────────────

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen NDC quad
  }
`;

const frag = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uColorPhase;
  uniform float uAspect;
  uniform int   uCount;

  varying vec2 vUv;

  float h(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 p = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);
    vec3 col = vec3(0.0, 0.008, 0.025); // near-black base tint

    for (int i = 0; i < 25; i++) {
      if (i >= uCount) break;

      float fi  = float(i);
      float ph  = h(fi) * 6.2832;
      float sp  = 0.04 + h(fi + 10.0) * 0.14;
      float rx  = (0.45 + h(fi + 20.0) * 0.8) * uAspect;
      float ry  = 0.28 + h(fi + 30.0) * 0.65;
      float br  = 0.25 + h(fi + 40.0) * 0.75;

      float t  = uTime * sp + ph;
      float t2 = t + 0.018;

      // Lissajous-like curve center
      vec2 c  = vec2(sin(t)  * rx + cos(t  * 2.3 + 1.0) * rx * 0.3,
                     cos(t  * 0.71) * ry + sin(t  * 1.63 + 0.7) * ry * 0.3)
                + uMouse * vec2(0.07 * uAspect, 0.07);
      vec2 c2 = vec2(sin(t2) * rx + cos(t2 * 2.3 + 1.0) * rx * 0.3,
                     cos(t2 * 0.71) * ry + sin(t2 * 1.63 + 0.7) * ry * 0.3);

      vec2 vel = normalize(c2 - c + vec2(0.00001));

      // Elongated streak in velocity direction
      vec2  d     = p - c;
      float along = dot(d, vel);
      float perp  = length(d - along * vel);
      float streak = exp(-perp * perp * 90.0 + min(0.0, along) * along * 3.0) * br;
      streak *= 0.55 + 0.45 * sin(uTime * sp * 5.0 + ph * 2.0);

      // Blue → cyan → teal palette (hue 0.50-0.63) with per-stage shift
      float hue = 0.515 + uColorPhase * 0.018 + h(fi + 50.0) * 0.115;
      float h6  = mod(hue * 6.0, 6.0);
      float hf  = fract(h6);
      vec3 rgb;
      if      (h6 < 1.0) rgb = vec3(1.0 - hf, 1.0, 0.0);
      else if (h6 < 2.0) rgb = vec3(0.0, 1.0, hf);
      else if (h6 < 3.0) rgb = vec3(0.0, 1.0 - hf, 1.0);
      else if (h6 < 4.0) rgb = vec3(hf, 0.0, 1.0);
      else if (h6 < 5.0) rgb = vec3(1.0, 0.0, 1.0 - hf);
      else                rgb = vec3(1.0, hf, 0.0);

      col += rgb * streak * 2.4;
    }

    col  = col / (col + 1.0);           // Reinhard tone-map
    col  = pow(col, vec3(0.82));        // gamma tweak
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Inner mesh (reads refs every frame — zero React re-renders) ─────────────

type BgRefs = {
  mouse: MutableRefObject<[number, number]>;
  phase: MutableRefObject<number>;
  count: number;
};

function BgMesh({ refs }: { refs: BgRefs }) {
  const { size } = useThree();

  const uni = useMemo(
    () => ({
      uTime:       { value: 0 },
      uMouse:      { value: new THREE.Vector2() },
      uColorPhase: { value: 0 },
      uAspect:     { value: 1 },
      uCount:      { value: refs.count },
    }),
    [refs.count],
  );

  useFrame(({ clock }) => {
    uni.uTime.value       = clock.getElapsedTime();
    uni.uMouse.value.set(refs.mouse.current[0], refs.mouse.current[1]);
    uni.uColorPhase.value = refs.phase.current;
    uni.uAspect.value     = size.width / size.height;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uni}
        vertexShader={vert}
        fragmentShader={frag}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Exported Canvas component ───────────────────────────────────────────────

type Props = {
  mouseRef:      MutableRefObject<[number, number]>;
  colorPhaseRef: MutableRefObject<number>;
  isMobile:      boolean;
};

export default function HeroScene({ mouseRef, colorPhaseRef, isMobile }: Props) {
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1;

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 1] }}
      style={{ display: "block", width: "100%", height: "100%", background: "#000" }}
    >
      <BgMesh refs={{ mouse: mouseRef, phase: colorPhaseRef, count: isMobile ? 12 : 22 }} />
    </Canvas>
  );
}
