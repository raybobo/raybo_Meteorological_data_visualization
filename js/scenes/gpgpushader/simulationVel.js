var simulationVel = [
  // #define resolution vec2( 128.0, 128.0 )

  // uniform sampler2D textureVel;
  // uniform sampler2D texturePos;
  'uniform float time;',
  'void main() {',
  '  vec2 cellSize = 1.0 / resolution.xy;',
  '  vec2 uv = gl_FragCoord.xy * cellSize;',
  '  gl_FragColor = texture2D( textureVel, uv );',
  '}'

].join('\n');

export default simulationVel;