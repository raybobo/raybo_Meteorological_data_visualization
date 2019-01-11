import * as THREE from '../libs_es6/three.module.js';
import cloudy_shapes from "./shadertoy/cloudy_shapes.js";
// raymarching cloud shadertoy
function Scene9(params) {
  this.fragment_shader4 = cloudy_shapes;
  // gl_FragColor       tiem   vUv
  this.vertexShader = [
    "varying vec2 vUv;",
    "	void main()",
    "	{",
    "		vUv = uv;",
    "		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "		gl_Position = projectionMatrix * mvPosition;",
    "	}"
  ].join("\n");

  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.addCube();
    this.addLight();
    SceneController.scene = this.scene;
  };
  this.addLight = function() {
    // light
    var light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    this.scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-1, -1, 1);
    this.scene.add(light2);
    this.scene.add(new THREE.AmbientLight(0x666666));
  };

  this.addCube = function() {
    var geometry = new THREE.PlaneBufferGeometry(32, 18, 1);

    this.uniforms = {
      time: { value: 1.0 },
      iResolution: { value: new THREE.Vector2(1920, 1080) },
      iMouse: { value: new THREE.Vector3(0, 0, 0) }
      //
    };
    var material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragment_shader4,
      side: THREE.DoubleSide
    });
    // var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  };
  this.update = function(nowTime) {
    this.uniforms.time.value = nowTime;
  };
}

export default Scene9;
