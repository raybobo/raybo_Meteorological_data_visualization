import * as THREE from '../libs_es6/three.module.js';
import GPUComputationRenderer from '../module_es6/GPUComputationRenderer.js';
import testShader from './gpgpushader/testShader.js';
// 基本框架
function Scene11(params) {
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.renderer = SceneController.renderer;
    this.camera = SceneController.camera;
    this.WIDTH = 128;
    this.addVisualPlane();
    this.initGpuCompute();
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

  this.addVisualPlane = function() {
    var geometry =
        new THREE.PlaneBufferGeometry(this.WIDTH * 0.1, this.WIDTH * 0.1, 1);
    var material = new THREE.MeshBasicMaterial({map: null});
    // var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.visualPlane = new THREE.Mesh(geometry, material);
    this.scene.add(this.visualPlane);
  };
  this.initGpuCompute = function() {
    // Initialization...

    // Create computation renderer
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);

    // Create initial state float textures
    var pos0 = this.gpuCompute.createTexture();
    // and fill in here the texture data...

    this.fillTexture(pos0);

    // Add texture variables
    this.posVar =
        this.gpuCompute.addVariable('texturePosition', testShader, pos0);

    // Add variable dependencies
    this.gpuCompute.setVariableDependencies(this.posVar, [this.posVar]);

    // Add custom uniforms
    this.posVar.material.uniforms.time = {value: 0.0};

    // Check for completeness
    var error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  };
  this.fillTexture = function(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
      var index = k / 4;

      theArray[k + 0] = 0.1;
      theArray[k + 1] = 0.2;
      theArray[k + 2] = 0.3;
      theArray[k + 3] = -1;
    }
  };
  this.update = function() {
    this.gpuCompute.compute();
    this.visualPlane.material.map =
    this.gpuCompute.getCurrentRenderTarget(this.posVar).texture;
  };
}

export default Scene11;
