#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359;

uniform float u_time;
uniform float u_fSpeed;
uniform float u_offset1;
uniform float u_offset2;
uniform float u_fFrequency; 
uniform float u_rotation;
uniform float u_noiseFactor;
uniform float u_lightBlur;
uniform float u_lightIntensity;
uniform vec3 u_baseColor;
uniform vec3 u_color1;
uniform vec3 u_color2; 
uniform vec3 u_color3;

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

// Lines
float lines(vec2 _uv, float _offset, float _freq){
    return smoothstep (
        0., 
        0.5 + _offset * 0.5, 
        abs(0.5 * sin(_uv.x * _freq) + _offset * 2.)
    );
}

// Rotation Mattrix
mat2 rotate2D (float angle){
    return mat2 ( 
        cos(angle), - sin(angle),
        sin(angle), cos(angle)
    );
}

void main (){

    /* Light */
    float fresnel = dot(cameraPosition, v_normal);
    float light = smoothstep(0., u_lightBlur, fresnel);

    /* Colors */
    vec3 baseColor = u_baseColor;
    vec3 accent1 = u_color1;
    vec3 accent2 = u_color2;
    vec3 accent3 = u_color3;

    /* Pattern */
    float speed = u_time * u_fSpeed;
    
    float nf = u_noiseFactor;
    float n = nf * noise(v_position + speed) - (1. - nf);
    vec2 fakeUv = rotate2D(n * u_rotation) * v_position.xy;
    float pattern1 = lines(fakeUv, u_offset1, u_fFrequency);
    float pattern2 = lines(fakeUv, u_offset2, u_fFrequency);
    vec3 finalPatern = mix(accent1, accent2, pattern1);
    finalPatern = mix(finalPatern, accent3, pattern1);
    finalPatern = mix(finalPatern, baseColor, pattern2);

    /* Mix Light + pattern */
    vec3 finalMix = light  * finalPatern * u_lightIntensity;

    gl_FragColor = vec4(finalMix, 1.);
}