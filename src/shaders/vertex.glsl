#version 300 es
precision highp float;

in vec3 pointColor;
in vec3 pointColorRandom;
in vec2 pointPosition;

out vec3 color;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
    color = vec3(pointColor.r+random(pointPosition)*pointColorRandom.r,pointColor.g+random(pointPosition)*pointColorRandom.g,pointColor.b+random(pointPosition)*pointColorRandom.b);
    gl_Position = vec4(pointPosition, 0.0, 1.0);
    gl_PointSize = 4.0;
}