#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D recTex;
uniform sampler2D blinkTex;

uniform vec2 resolution;
uniform vec2 unit_origin;
uniform float outer_radius;     //0 to 1
uniform float inner_radius;     //0 to 1
uniform float strength_factor;    //0 to 1

uniform float line_thickness;    //0 to 1
uniform float line_count;    //0 to 1
uniform float line_speed;    //0 to 1

uniform float darkness_factor;    //0 to 1
uniform float noise_strength;    //0 to 1

uniform float time;
uniform float blink_timer;

float random( vec2 p )
{
  vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
  );
return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main() {

    // Texture
    vec4 color = texture2D(uSampler, vTextureCoord);
    vec4 overlay = texture2D(recTex, vec2(vTextureCoord.x, 1.0-vTextureCoord.y));
    vec4 blink = texture2D(blinkTex, vec2(vTextureCoord.x, 1.0-vTextureCoord.y));

    // Stripes
    float pos = vTextureCoord.y * line_count;
    float line = (1.0 - floor(fract(pos-time*line_speed) + line_thickness));
    color.rgb = mix(color.rgb, vec3(1.0), line);

    // Noise
    vec2 uvRandom = vTextureCoord;
    uvRandom.y *= random(vec2(vTextureCoord.y,time));
      color.rgb += random(uvRandom)*noise_strength;

    // Darkening filter
    color.rgb -= vec3(darkness_factor);

    // Vignette
    vec2 position = gl_FragCoord.xy / resolution - unit_origin;
    float len = length(position);
    float vignette = smoothstep(outer_radius, inner_radius, len);
    color.rgb = mix(color.rgb, color.rgb * vignette, strength_factor);

    // Overlays
    color.rgb = mix(color.rgb, overlay.rgb, overlay.a);
    color.rgb = mix(color.rgb, blink.rgb, blink.a * blink_timer);

    gl_FragColor = color;
}