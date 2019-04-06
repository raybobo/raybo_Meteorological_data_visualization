var simulationPos = [
  // #define resolution vec2( 128.0, 128.0 )
  // uniform sampler2D textureVel;
  // uniform sampler2D texturePos;

  "uniform float particleMoveSpeed;",

  "float map(float value, float min1, float max1, float min2, float max2) {",
  "  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);",
  "}",
  "vec2 mapv2(vec2 valueIn, float min1, float max1, float min2, float max2) {",
  "  float x = map(valueIn.x, min1, max1, min2, max2);",
  "  float y = map(valueIn.y, min1, max1, min2, max2);",
  "  return vec2(x, y);",
  "}",

  
  "float rand(vec2 co){",
  "  return fract(sin(dot(fract(co.xy) ,vec2(12.9898,78.233))) * 43758.5453);",
  "}",

  "void main() {",
  "  vec2 cellSize = 1.0 / resolution.xy;",
  "  vec2 uv = gl_FragCoord.xy * cellSize;",
  "  vec4 nowPos = texture2D( texturePos, uv );",
  "	 float nowLife = nowPos.w;",
  // cal true vel
  "  vec4 speed = texture2D( textureVel, nowPos.xy );",
  "  vec2 nowSpeed = speed.xy;",
  "  float max = 28.700000762939453;",
  "  vec2 trueSpeed = mapv2(nowSpeed, 0.0, 1.0, -max, max);",
  "  trueSpeed *= vec2(particleMoveSpeed);",
  "  nowPos.xy += trueSpeed;",

  // life fall down
  "	 nowLife -= 0.01;",
  "	 if (nowLife < 0.0) {",
  "	 	 nowLife = 1.0;",
  "	 	 nowPos.x = rand(nowPos.xy+uv);",
  "	 	 nowPos.y = rand(nowPos.yx+uv);",
  "	 } ",
  // check out of box
  "	 if (nowPos.x < 0.0 || nowPos.x > 1.0 || nowPos.y < 0.0 || nowPos.y > 1.0) {",
  "	 	 nowPos.x = rand(nowPos.xy);",
  "	 	 nowPos.y = rand(nowPos.yx);",
  "	 } ",
  
  "  gl_FragColor = vec4(nowPos.xyz, nowLife);",
  "}"
].join("\n");

export default simulationPos;
