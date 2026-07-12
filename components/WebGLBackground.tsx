"use client";

import { useEffect, useRef } from "react";

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Vertex Shader: Renders a full-screen quad
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: High-performance neon heart tunnel
    const fsSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float sdHeart(vec2 p) {
        // Center the heart vertically
        p.y -= 0.25;
        // Warp coordinates to form the parametric heart shape
        p.y -= sqrt(abs(p.x)) * 0.65;
        return length(p);
      }

      void main() {
        // Normalize UV coordinates based on aspect ratio
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Parallax offset matching mouse tilt
        uv -= u_mouse * 0.1;

        // Position and scale for the heart mapping space
        vec2 p = uv * 3.5;
        p.y += 0.45; // Adjust vertical centering offset

        float d = sdHeart(p);

        // Render 6 discrete, enlarging 2D hearts for uniform spacing and higher density
        float lineGlow = 0.0;
        
        for (int i = 0; i < 6; i++) {
          float offset = float(i) * 0.1666;
          float progress = fract(u_time * 0.15 + offset); // speed of expansion
          float scale = progress * 3.5;                  // max size before fading
          
          // Distance to the boundary of the heart at this scale
          float distToBoundary = abs(d - scale);
          
          // Double-glow neon model for this specific heart outline
          float core = 0.008 / (distToBoundary + 0.002);
          float neon = 0.035 / (distToBoundary + 0.035);
          float heartGlow = core + neon * 0.8;
          
          // Fade in near the center, fade out as it reaches maximum scale
          float fade = smoothstep(0.0, 0.2, progress) * smoothstep(1.0, 0.75, progress);
          
          lineGlow += heartGlow * fade;
        }

        // Vignette: fade out outer boundaries for a clean frame edge
        lineGlow *= smoothstep(1.5, 0.2, length(uv));
        
        // Antialiasing: fade out the absolute center to prevent pixel noise
        lineGlow *= smoothstep(0.01, 0.12, d);

        // Dim the overall glow intensity to 60% for a softer presence
        lineGlow *= 0.6;

        // Luminous Neon Color Scheme
        vec3 pink = vec3(1.0, 0.08, 0.58);   // Hot Pink
        vec3 gold = vec3(1.0, 0.75, 0.2);    // Cozy Gold
        vec3 purple = vec3(0.55, 0.0, 1.0);  // Deep Purple Aura

        // Interpolate ring gradients dynamically over space and time
        vec3 ringColor = mix(pink, gold, sin(d * 3.0 + u_time * 1.2) * 0.5 + 0.5);
        ringColor = mix(ringColor, purple, cos(length(uv) * 2.0 - u_time * 0.6) * 0.4 + 0.4);

        // Soft ambient backing glow to prevent total blackness
        vec3 ambient = vec3(0.03, 0.01, 0.02) * (1.0 - length(uv) * 0.8);
        vec3 color = ringColor * lineGlow + ambient;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `;

    // Compile Shader Helper
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    // Link Program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Geometry data for a full-screen quad (2 triangles)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Retrieve uniform locations
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");

    // Interactive mouse positioning
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove);

    // Resize Handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    // Render loop
    const startTime = performance.now();
    let animationFrameId: number;

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const elapsed = (performance.now() - startTime) / 1000;

      // Pass uniforms to shader program
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, mouse.x, mouse.y);

      // Render quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-[100svh] z-0 pointer-events-none overflow-hidden blur-[2px]"
    />
  );
}
