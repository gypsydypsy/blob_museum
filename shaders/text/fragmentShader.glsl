// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying float vLineIndex;
varying float vLineLettersTotal;
varying float vLineLetterIndex;
varying float vLineWordsTotal;
varying float vLineWordIndex;
varying float vWordIndex;
varying float vLetterIndex;

// Common Uniforms
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

// Strokes uniforms
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;
uniform float uLinesTotal;
uniform float uLettersTotal;
uniform float uWordsTotal;

// Custom uniforms
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_op;

// Utils
float median(float r, float g, float b) {
   return max(min(r, g), min(max(r, g), b));
}	

void main() {
   // Common
   // Texture sample
   vec3 s = texture2D(uMap, vUv).rgb;

   // Signed distance
   float sigDist = median(s.r, s.g, s.b) - 0.5;
   float afwidth = 1.4142135623730951 / 2.0;

   #ifdef IS_SMALL
      float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
   #else
      float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
   #endif


   // Strokes
   // Outset
   float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

   // Inset
   float sigDistInset = sigDist - uStrokeInsetWidth * 0.2; // Original : 0.5

   #ifdef IS_SMALL
      float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
      float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
   #else
      float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
      float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
   #endif


   // Alpha Test
   if (alpha < uAlphaTest) discard;

   /* Custom */ 
   float dist = distance(u_mouse, - vViewPosition.xy);
   float d = step(0.05, dist);
   float range = .5;

   float opacity = uOpacity * u_op;
   /* ./Custom */

   // Border
   float border = outset * inset;
   vec4 strokedFragColor = vec4(uStrokeColor, opacity * border);
   //gl_FragColor = strokedFragColor;

   // Fill
   vec4 filledFragColor = vec4(uColor, opacity * alpha);
   //gl_FragColor = filledFragColor;

   // Final Mix
   vec4 finalColor = mix(strokedFragColor, filledFragColor, d * clamp(0., 1., u_time * 0.5));

   gl_FragColor = finalColor;
}