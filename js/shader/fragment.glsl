varying float vNoise;
uniform sampler2D girlTexture;
varying vec2 vUv;
uniform float time;
void main()	{
	//vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	//gl_FragColor = vec4(vUv,0.0,1.);
	vec3 color1 = vec3(1., 0., 0.);
	vec3 color2 = vec3(0., 0., 1.);
	vec3 finalColor = mix(color1, color2, 0.5*(vNoise +1.));

	vec2 newUV = vUv;

	newUV = vec2(newUV.x + 0.05*sin(newUV.y*10.0 + time), newUV.y); 

	vec4 girlView = texture2D(girlTexture, newUV);

	gl_FragColor = vec4(finalColor,1.);
	gl_FragColor = vec4(vUv, 0., 1.);
	//gl_FragColor = vec4(girlView);
	//gl_FragColor = girlView + vec4(vNoise);
	//gl_FragColor = vec4(vNoise);
}