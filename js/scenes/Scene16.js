import * as THREE from "../libs_es6/three.module.js";
import GPUComputationRenderer from "../module_es6/GPUComputationRenderer.js";
import noiseShader from "./gpgpushader/valueNoise.js";
// 基本框架
function Scene16(params) {
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;
    this.renderer = SceneController.renderer;
    this.camera = SceneController.camera;

    this.cameraRadius = 20;
    this.cameraHeight = 1.28;
    this.camera.position.set(0, this.cameraHeight, this.cameraRadius);

    this.WIDTH = 256;
    this.addVisualPlane();
    this.initGpuCompute();
    this.addLight();
    SceneController.scene = this.scene;

    SceneController.addHelper(10);
    SceneController.orbitControls.enabled = false;
    SceneController.triggleHelper(false);
    SceneController.applyInfoTitleAndDetail(
      "场景十六",
      "GPGPU 生成二维流场\n" +
        "\n " +
        "生成一张 256 * 256 px 的纹理，并利用 GPU，在 shader 中对每一个像素使用 noise 算法，生成标量场，然后将其映射为亮度，可视化在一个平面上。\n" +
        "右上角图形界面可以控制相关参数。"
    );
  };

  this.initSceneGUI = function(guiController) {
    this.guiParms = {
      displayHelper: false,
      noiseUpdate: true,
      noiseUpdateSpeed: 0.01,
      noiseNowTime: 0.0,
      noiseStep: 2.0,
      uvScale: 4.0,
    };
    this.guiFolder = guiController.gui.addFolder("Scene");
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "noiseUpdate");
    this.guiFolder.add(this.guiParms, "noiseStep", 1.0, 4.0, 1.0);
    this.guiFolder.add(this.guiParms, "uvScale", 1.0, 20.0);
    this.guiFolder.add(this.guiParms, "noiseUpdateSpeed", 0.005, 0.05);
    this.guiFolder.open();
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
    var geometry = new THREE.PlaneBufferGeometry(
      this.WIDTH * 0.1,
      this.WIDTH * 0.1,
      1
    );
    var material = new THREE.MeshBasicMaterial({
      map: null,
      side: THREE.DoubleSide
    });
    // var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.visualPlane = new THREE.Mesh(geometry, material);
    this.scene.add(this.visualPlane);
  };

  this.initGpuCompute = function() {
    // Initialization...

    // Create computation renderer
    this.gpuCompute = new GPUComputationRenderer(
      this.WIDTH,
      this.WIDTH,
      this.renderer
    );

    // Create initial state float textures
    var pos0 = this.gpuCompute.createTexture();
    // and fill in here the texture data...

    this.fillTexture(pos0);

    // Add texture variables
    this.posVal = this.gpuCompute.addVariable(
      "texturePosition",
      noiseShader,
      pos0
    );

    // Add variable dependencies
    this.gpuCompute.setVariableDependencies(this.posVal, [this.posVal]);

    // Add custom uniforms
    this.posVal.material.uniforms.time = { value: 0.0 };
    this.posVal.material.uniforms.noiseStep = { value: 2.0 };
    this.posVal.material.uniforms.uvScale = { value: 4.0 };
    // console.log(this.posVal.material.uniforms.time);

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
    if(this.guiParms.noiseUpdate) {
      this.guiParms.noiseNowTime += this.guiParms.noiseUpdateSpeed;
    }
    this.posVal.material.uniforms.time.value = this.guiParms.noiseNowTime;
    this.posVal.material.uniforms.uvScale.value = this.guiParms.uvScale;
    this.posVal.material.uniforms.noiseStep.value = this.guiParms.noiseStep;



    this.gpuCompute.compute();
    this.visualPlane.material.map = this.gpuCompute.getCurrentRenderTarget(
      this.posVal
    ).texture;
    // console.log(this.gpuCompute.getCurrentRenderTarget(this.posVal).texture);
  };
}

export default Scene16;
