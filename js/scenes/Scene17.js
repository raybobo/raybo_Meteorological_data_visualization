import * as THREE from "../libs_es6/three.module.js";
import GPUComputationRenderer from "../module_es6/GPUComputationRenderer.js";
import simulationVel from "./gpgpushader/simulationVel.js";
import simulationPos from "./gpgpushader/simulationPos.js";
import cubeVertShader from "./gpgpushader/cubeVert.js";
import cubeFragShader from "./gpgpushader/cubeFrag.js";

// 基本框架
var dataW = 360;
var dataH = 181;
var scaleRate = 0.1;
function Scene17(params) {
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;

    this.WIDTH = 128;
    this.geoType = "Cone";

    this.addVectorVisualPlane();
    // gpgpu
    this.renderer = SceneController.renderer;
    this.camera = SceneController.camera;

    SceneController.scene = this.scene;
    SceneController.addHelper(10);
    SceneController.orbitControls.enabled = true;
    SceneController.triggleHelper(false);
    SceneController.applyInfoTitleAndDetail(
      "场景十七",
      "GPGPU 二维流场可视化\n" +
        "\n " +
        "加载预处理的流场数据进入GPU后，生成一张 128 * 128 px 的纹理，每个像素代表一个基本单元的位置和生命信息，并利用 GPU 在 shader 中对每一个像素进行计算。\n" +
        "右上角图形界面可以控制相关参数。"
    );
  };
  this.initSceneGUI = function(guiController) {
    this.guiParms = {
      displayHelper: false,
      displayDataPlane: true,
      particleMoveSpeed: 0.0001,
      particleScale: 10.0,
      maxColor: "#ff2222",
      minColor: "#ffffff",
      particleType: "Cone",
      textureWidth: "128 X 128",
      noiseNowTime: 0.0
    };
    this.guiFolder = guiController.gui.addFolder("Scene");
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder
      .add(this.guiParms, "textureWidth", [
        "128 X 128",
        "256 X 256",
        "512 X 512",
        "1024 X 1024",
        "2048 X 2048"
      ])
      .onChange(
        function(value) {
          switch (value) {
            case "128 X 128":
              this.WIDTH = 128;
              break;
            case "256 X 256":
              this.WIDTH = 256;
              break;
            case "512 X 512":
              this.WIDTH = 512;
              break;
            case "1024 X 1024":
              this.WIDTH = 1024;
              break;
            case "2048 X 2048":
              this.WIDTH = 2048;
              break;
          }
          this.initGPGPU();
        }.bind(this)
      );
    this.guiFolder
      .add(this.guiParms, "particleType", [
        "Cylinder",
        "Circle",
        "Torus",
        "Cone",
        "Box"
      ])
      .onChange(
        function(value) {
          this.geoType = value;
          this.initGPGPU();
        }.bind(this)
      );
    this.guiFolder
      .add(this.guiParms, "particleMoveSpeed", 0.00001, 0.0003)
      .onChange(
        function(value) {
          // this.sceneController.triggleHelper(value);
          this.posVal.material.uniforms.particleMoveSpeed.value = value;
        }.bind(this)
      );
    this.guiFolder.add(this.guiParms, "particleScale", 5.0, 20.0).onChange(
      function(value) {
        // this.sceneController.triggleHelper(value);
        this.gpgpuObjMaterial.uniforms.uScale1.value = value;
      }.bind(this)
    );
    this.guiFolder.addColor(this.guiParms, "maxColor").onChange(
      function(value) {
        this.gpgpuObjMaterial.uniforms.startColor.value = new THREE.Color(
          value
        );
      }.bind(this)
    );
    this.guiFolder.addColor(this.guiParms, "minColor").onChange(
      function(value) {
        this.gpgpuObjMaterial.uniforms.endColor.value = new THREE.Color(value);
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "displayDataPlane").onChange(
      function(value) {
        this.visualPlane.visible = value;
        this.VectorVisualPlane.visible = value;
      }.bind(this)
    );

    this.guiFolder.open();
  };
  this.initGPGPU = function() {
    this.GPGPUinit = true;
    this.addGPGPUVisualPlane();
    this.initGpuCompute();
    // this.createGpgpuObj(new THREE.ConeBufferGeometry(14, 40, 5));

    switch (this.geoType) {
      case "Cylinder":
        this.createGpgpuObj(new THREE.CylinderBufferGeometry(15, 15, 5, 6));
        break;
      case "Circle":
        this.createGpgpuObj(new THREE.CircleBufferGeometry(20, 32));
        break;
      case "Torus":
        this.createGpgpuObj(new THREE.TorusBufferGeometry(30, 4, 5, 3));
        break;
      case "Cone":
        this.createGpgpuObj(new THREE.ConeBufferGeometry(14, 40, 5));
        break;
      case "Box":
        this.createGpgpuObj(new THREE.BoxBufferGeometry(14, 40, 14));
        break;
    }
    // setTimeout(function() {
    //   this.createGpgpuObj(new THREE.TorusBufferGeometry(30, 4, 5, 3));

    // }.bind(this), 2000);
  };

  this.createGpgpuObj = function(originalG) {
    // var originalG = new THREE.CylinderBufferGeometry(15, 15, 5, 6);
    // var originalG = new THREE.CircleBufferGeometry( 20, 32 );
    // var originalG = new THREE.TorusBufferGeometry(30, 4, 5, 3);
    // var originalG = new THREE.ConeBufferGeometry(14, 40, 5);
    // var originalG = new THREE.BoxBufferGeometry(14, 40, 14);
    var geometry = new THREE.InstancedBufferGeometry();
    var vertices = originalG.attributes.position.clone();
    geometry.addAttribute("position", vertices);

    var normals = originalG.attributes.normal.clone();
    geometry.addAttribute("normal", normals);

    // uv
    var uvs = originalG.attributes.uv.clone();
    geometry.addAttribute("uv", uvs);

    // index
    var indices = originalG.index.clone();
    geometry.setIndex(indices);

    geometry.maxInstancedCount = this.WIDTH * this.WIDTH;
    var nums = new THREE.InstancedBufferAttribute(
      new Float32Array(this.WIDTH * this.WIDTH * 1),
      1,
      false
    );
    var numRatios = new THREE.InstancedBufferAttribute(
      new Float32Array(this.WIDTH * this.WIDTH * 1),
      1,
      false
    );
    for (var i = 0; i < nums.count; i++) {
      nums.setX(i, i);
      numRatios.setX(i, i / (nums.count - 1));
    }
    geometry.addAttribute("aNum", nums);
    geometry.addAttribute("aNumRatio", numRatios);

    this.gpgpuObjMaterial = new THREE.ShaderMaterial({
      uniforms: {
        posMap: {
          type: "t",
          value: this.gpuCompute.getCurrentRenderTarget(this.posVal).texture
        },
        velMap: {
          type: "t",
          value: this.windsDataTexture
        },
        uSize: { type: "f", value: this.WIDTH },
        uTick: { type: "f", value: 0 },
        uScale2: { type: "v3", value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uScale1: { type: "f", value: 10.0 },
        startColor: { type: "v3v", value: new THREE.Color("#ff2222") },
        endColor: { type: "v3v", value: new THREE.Color("#ffffff") }
      },

      vertexShader: cubeVertShader,
      fragmentShader: cubeFragShader,
      side: THREE.DoubleSide,
      flatShading: true,
      transparent: true
    });
    if (this.gpgpuObjMesh) {
      this.scene.remove(this.gpgpuObjMesh);
    }
    this.gpgpuObjMesh = new THREE.Mesh(geometry, this.gpgpuObjMaterial);
    this.scene.add(this.gpgpuObjMesh);
    // this.gpgpuObjMesh.position.z = 1.1;
    this.gpgpuObjMesh.position.z = 0.1;
  };
  this.addVectorVisualPlane = function() {
    var geometry = new THREE.PlaneGeometry(
      dataW * scaleRate,
      dataH * scaleRate
    );
    this.windsDataTexture = new THREE.TextureLoader().load(
      // "./../../assets/data/gfsPng/g.png"
      // "./../../assets/data/gfsPng/g.png"
      "./echartData/windsPng/rg.png",
      // "./../../assets/data/windsPng/g.png"
      function(texture) {
        // in this example we create the material when the texture is loaded
        this.initGPGPU("Cone", 128);
      }.bind(this)
    );
    this.windsDataTexture.flipY = false;

    // console.log(this.windsDataTexture);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: this.windsDataTexture,
      side: THREE.DoubleSide
    });
    this.VectorVisualPlane = new THREE.Mesh(geometry, material);
    // VectorVisualPlane.position.y = -20.0;
    this.scene.add(this.VectorVisualPlane);
  };

  this.addGPGPUVisualPlane = function() {
    var geometry = new THREE.PlaneBufferGeometry(10.0, 10.0, 1);
    var material = new THREE.MeshBasicMaterial({
      map: null,
      side: THREE.DoubleSide
    });
    // var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.visualPlane = new THREE.Mesh(geometry, material);
    // this.visualPlane.position.z = 0.1;
    this.visualPlane.position.x = -25.0;
    // this.visualPlane.position.y = 17.0;
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
    var offset0 = this.gpuCompute.createTexture();
    // and fill in here the texture data...

    this.fillPosTexture(pos0);

    // this.fillOffsetTexture(offset0);
    // console.log(pos0);

    // Add texture variables
    this.posVal = this.gpuCompute.addVariable(
      "texturePos",
      simulationPos,
      pos0
    );
    this.velVal = this.gpuCompute.addVariable(
      "textureVel",
      simulationVel,
      this.windsDataTexture
    );
    // this.offsetVal = this.gpuCompute.addVariable(
    //   "textureVel",
    //   simulationVel,
    //   this.windsDataTexture
    // );

    // Add variable dependencies
    this.gpuCompute.setVariableDependencies(this.posVal, [
      this.posVal,
      this.velVal
    ]);
    this.gpuCompute.setVariableDependencies(this.velVal, [
      this.posVal,
      this.velVal
    ]);

    // Add custom uniforms
    this.posVal.material.uniforms.particleMoveSpeed = { value: 0.0001 };
    // this.posVal.material.uniforms._resolution = { value: new THREE.Vector2(this.WIDTH, this.WIDTH) };
    // console.log(this.posVal.material.uniforms);

    // Check for completeness
    var error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  };
  this.fillPosTexture = function(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
      var index = k / 4;

      theArray[k + 0] = (index % this.WIDTH) / this.WIDTH;
      theArray[k + 1] = index / this.WIDTH / this.WIDTH;
      theArray[k + 2] = 0.0;
      theArray[k + 3] = index / (this.WIDTH * this.WIDTH);
    }
  };
  this.fillOffsetTexture = function(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
      var index = k / 4;

      theArray[k + 0] = Math.random();
      theArray[k + 1] = Math.random();
      theArray[k + 2] = 0.0;
      theArray[k + 3] = index / (this.WIDTH * this.WIDTH);
    }
  };

  this.update = function() {
    if (this.GPGPUinit) {
      this.gpuCompute.compute();
      // this.posVal.material.uniforms.time.value = performance.now() * 0.001;
      this.visualPlane.material.map = this.gpuCompute.getCurrentRenderTarget(
        this.posVal
      ).texture;
    }
    // console.log(this.gpuCompute.getCurrentRenderTarget(this.posVal).texture);
  };
}

export default Scene17;
