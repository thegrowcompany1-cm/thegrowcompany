"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, MutableRefObject } from "react";
import * as THREE from "three";

// ── Shaders ────────────────────────────────────────────────────────────────

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform float uProgress; // 0-1 scroll progress
  uniform float uAspect;
  uniform int   uCount;

  varying vec2 vUv;

  float h(float n) { return fract(sin(n) * 43758.5453); }

  // Compute streak center with stage-based offsets applied
  vec2 streakCenter(float t_val, float rx, float ry,
                    float t_rush, float t_conv, float t_spread, float fi) {
    vec2 c = vec2(
      sin(t_val) * rx + cos(t_val * 2.3 + 1.0) * rx * 0.3,
      cos(t_val * 0.71) * ry + sin(t_val * 1.63 + 0.7) * ry * 0.3
    );
    // Stage 2 – rush upward
    c.y += t_rush * (1.0 - t_conv) * 1.6;
    // Stage 3 – converge toward screen center
    c = mix(c, vec2(0.0), t_conv * (1.0 - t_spread) * 0.88);
    // Stage 4 – spread radially outward
    float spreadAngle = h(fi + 77.0) * 6.2832;
    c += vec2(cos(spreadAngle), sin(spreadAngle)) * t_spread * 2.2;
    return c;
  }

  void main() {
    vec2 p = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);

    // Stage transition smoothsteps
    float t_rush   = smoothstep(0.25, 0.50, uProgress);
    float t_conv   = smoothstep(0.50, 0.75, uProgress);
    float t_spread = smoothstep(0.75, 1.00, uProgress);

    // Background tint shifts slightly toward deep violet at end
    vec3 col = mix(vec3(0.0, 0.008, 0.025), vec3(0.005, 0.0, 0.022), uProgress);

    for (int i = 0; i < 25; i++) {
      if (i >= uCount) break;

      float fi  = float(i);
      float ph  = h(fi) * 6.2832;
      float sp  = 0.04 + h(fi + 10.0) * 0.14;
      float rx  = (0.45 + h(fi + 20.0) * 0.8) * uAspect;
      float ry  = 0.28 + h(fi + 30.0) * 0.65;
      float br  = 0.25 + h(fi + 40.0) * 0.75;

      // Speed increases during rush, slows during convergence
      float speedMult = 1.0
        + t_rush * (1.0 - t_conv) * 2.8
        + t_spread * 0.5;

      float t  = uTime * sp * speedMult + ph;
      float t2 = t + 0.018 * (1.0 + t_rush * 2.0);

      vec2 c  = streakCenter(t,  rx, ry, t_rush, t_conv, t_spread, fi);
      vec2 c2 = streakCenter(t2, rx, ry, t_rush, t_conv, t_spread, fi);

      vec2  vel   = normalize(c2 - c + vec2(0.00001));
      vec2  d     = p - c;
      float along = dot(d, vel);
      float perp  = length(d - along * vel);

      // Streak narrows during rush, widens slightly at convergence
      float perpScale = 90.0 + t_rush * (1.0 - t_conv) * 55.0 - t_conv * 30.0;
      float streak = exp(-perp * perp * perpScale + min(0.0, along) * along * 3.0) * br;
      streak *= 0.55 + 0.45 * sin(uTime * sp * 5.0 + ph * 2.0);

      // Hue: blue-cyan (0.52) → blue (0.59) → violet (0.67)
      float hue = 0.52 + uProgress * 0.15 + h(fi + 50.0) * 0.10;
      float h6  = mod(hue * 6.0, 6.0);
      float hf  = fract(h6);
      vec3 rgb;
      if      (h6 < 1.0) rgb = vec3(1.0 - hf, 1.0, 0.0);
      else if (h6 < 2.0) rgb = vec3(0.0, 1.0, hf);
      else if (h6 < 3.0) rgb = vec3(0.0, 1.0 - hf, 1.0);
      else if (h6 < 4.0) rgb = vec3(hf, 0.0, 1.0);
      else if (h6 < 5.0) rgb = vec3(1.0, 0.0, 1.0 - hf);
      else                rgb = vec3(1.0, hf, 0.0);

      // Brightness spikes at rush and peaks at convergence
      float brightMult = 1.0
        + t_rush * (1.0 - t_conv) * 1.5
        + t_conv * (1.0 - t_spread) * 3.0;

      col += rgb * streak * 2.4 * brightMult;
    }

    // Central glow during convergence
    float convGlow = t_conv * (1.0 - t_spread)
                   * exp(-dot(p, p) * 1.6) * 4.5;
    col += vec3(0.25, 0.65, 1.0) * convGlow;

    col  = col / (col + 1.0);
    col  = pow(col, vec3(0.82));
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Inner mesh ─────────────────────────────────────────────────────────────

type Refs = {
  progress: MutableRefObject<number>;
  count:    number;
};

function BgMesh({ refs }: { refs: Refs }) {
  const { size } = useThree();

  const uni = useMemo(
    () => ({
      uTime:     { value: 0 },
      uProgress: { value: 0 },
      uAspect:   { value: 1 },
      uCount:    { value: refs.count },
    }),
    [refs.count],
  );

  useFrame(({ clock }) => {
    uni.uTime.value     = clock.getElapsedTime();
    uni.uProgress.value = refs.progress.current;
    uni.uAspect.value   = size.width / size.height;
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

// ── Exported Canvas ─────────────────────────────────────────────────────────

export default function ScrollJourneyScene({
  progressRef,
  isMobile,
}: {
  progressRef: MutableRefObject<number>;
  isMobile:    boolean;
}) {
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.25) : 1;

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 1] }}
      style={{ display: "block", width: "100%", height: "100%", background: "#000" }}
    >
      <BgMesh refs={{ progress: progressRef, count: isMobile ? 8 : 16 }} />
    </Canvas>
  );
}
