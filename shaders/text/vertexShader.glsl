// Attribute
attribute vec2 layoutUv;
attribute float lineIndex;
attribute float lineLettersTotal;
attribute float lineLetterIndex;
attribute float lineWordsTotal;
attribute float lineWordIndex;
attribute float wordIndex;
attribute float letterIndex;
    
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

// Custom uniforms
uniform vec2 u_mouse;
    
void main() {

    // Output
    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;

    /* Custom Code */
    float dist = distance(u_mouse, mvPosition.xy);
    float range = .05;
    float m = clamp(0., .1, dist);

    mvPosition.z += m * 0.4;
    
    /* ./Custom Code */

    gl_Position = projectionMatrix * mvPosition;
    
    // Varyings
    vUv = uv;
    vLayoutUv = layoutUv;
    vViewPosition = -mvPosition.xyz;
    vNormal = normal;
    vLineIndex = lineIndex;
    vLineLettersTotal = lineLettersTotal;
    vLineLetterIndex = lineLetterIndex;
    vLineWordsTotal = lineWordsTotal;
    vLineWordIndex = lineWordIndex;
    vWordIndex = wordIndex;
    vLetterIndex = letterIndex;
}
    