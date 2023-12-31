#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_vSpeed;

uniform float u_waveFactor;
uniform float u_waveAmplitude;
uniform float u_waveFrequency;
uniform float u_sphereWidth;
uniform float u_distortionFactor;
uniform float u_distortionFrequency;
uniform float u_distortionAmplitude;

varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;

// Noise 
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main () {  

    vec3 pos = position;
    vec3 norm = normal;

    /* Wave Transformation */
    float wf = u_waveFactor;

    float waveTransformPosition = wf * sin(pos.y * u_waveFrequency + u_vSpeed * u_time) * u_waveAmplitude + (1. - wf);
    pos.x = abs(pos.x * waveTransformPosition) * sign(pos.x) + pos.x * u_sphereWidth;
    pos.z = abs(pos.z * waveTransformPosition) * sign(pos.z) + pos.z * u_sphereWidth;

    float waveTransformNormal = wf * sin(norm.y * u_waveFrequency + u_vSpeed * u_time) * u_waveAmplitude + (1. - wf);
    norm.x = abs(norm.x * waveTransformNormal) * sign(norm.x);
    norm.z = abs(norm.z * waveTransformNormal) * sign(norm.z);
    
    /* Distort Transformation */
    float df = u_distortionFactor;
    float distortTransformPosition = df * noise(pos * u_distortionFrequency + u_vSpeed * u_time) * u_distortionAmplitude;
    pos += distortTransformPosition * norm;
    
    /* Distort Normal */
    float distortTransformNormal = df * noise(norm * u_distortionFrequency + u_vSpeed * u_time) * u_distortionAmplitude + (1. - df);
    norm = distortTransformNormal * norm;

    // /* Varyings */
    v_uv = uv;
    v_position = pos;
    v_normal = norm;

    /* Final position */
    vec4 modelPosition = modelMatrix * vec4(pos, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}