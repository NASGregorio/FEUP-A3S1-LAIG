#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uSampler2;

uniform vec2 resolution;
uniform vec2 unit_origin;
uniform float outer_radius; 	//0 to 1
uniform float inner_radius; 	//0 to 1
uniform float strength_factor;	//0 to 1

uniform float line_thickness;	//0 to 1
uniform float line_count;	//0 to 1

uniform float time;



void main() {

	vec4 color = texture2D(uSampler, vTextureCoord);
	vec4 noise = texture2D(uSampler2, vTextureCoord+vec2(0.0, -time*0.0001));

	// Stripes
	float pos = vTextureCoord.y * line_count;
	float line = (1.0 - floor(fract(pos-time*0.1) + line_thickness));
	//vec3 white = vec3(1.0);
	color.rgb = mix(color.rgb, vec3(1.0), line);

	// Vignette
	vec2 position = gl_FragCoord.xy / resolution - unit_origin;
	float len = length(position);
	float vignette = smoothstep(outer_radius, inner_radius, len);
	color.rgb = mix(color.rgb, color.rgb * vignette, strength_factor);

	// Noise
	color.rgb = mix(color.rgb, noise.rgb, 0.15);

	gl_FragColor = color;
}

//1920*937