import * as THREE from "../libs_es6/three.module.js";
import Maf from "../module_es6/maf.js";
import { MeshLine, MeshLineMaterial } from "../module_es6/three-meshline.js";
import windsData from "./echartData/winds.js";
// 基本框架
var dataW = 360;
var dataH = 181;
var scaleRate = 0.1;

function Scene15(params) {
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;
    SceneController.scene = this.scene;
    SceneController.addHelper(10);
    SceneController.orbitControls.enabled = true;
    SceneController.cameraResetPos();
    SceneController.triggleHelper(false);
    SceneController.applyInfoTitleAndDetail(
      "场景十五",
      "二维线条矢量场\n" +
        "\n " +
        "通过加载预处理的流场数据，生成 2000 条线条在其中运动，基于每条线条的头部位置来计算其下一步的旋转角度并步进，所有计算都是在 CPU 中进行的。\n" +
        "线条的颜色表示当前线条头部点的运行速度。\n" +
        "右上角图形界面可以暂停动画。"
    );

    this.addVectorVisualPlane();
    this.addLight();
    this.lineCount = 2000.0;
    this.addMeshLine();
  };
  this.initSceneGUI = function(guiController) {
    this.guiParms = {
      displayHelper: false,
      displayDataPlane: true,
      pause: false
    };
    this.guiFolder = guiController.gui.addFolder("Scene");
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "displayDataPlane").onChange(
      function(value) {
        this.visualPlane.visible = value;
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "pause");
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

  this.addVectorVisualPlane = function() {
    var geometry = new THREE.PlaneGeometry(
      dataW * scaleRate,
      dataH * scaleRate
    );
    var texture = new THREE.TextureLoader().load(
      // "./../../assets/data/gfsPng/g.png"
      // "./../../assets/data/gfsPng/g.png"
      "./echartData/windsPng/rg.png"
      // "./../../assets/data/windsPng/g.png"
    );
    texture.flipY = false;
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide
    });
    this.visualPlane = new THREE.Mesh(geometry, material);
    this.scene.add(this.visualPlane);
  };

  this.addMeshLine = function() {
    this.linesHolder = [];
    this.linesGroup = new THREE.Group();
    for (let index = 0; index < this.lineCount; index++) {
      var tempTrailMeshLine = new Scene15MeshLine();

      this.linesGroup.add(tempTrailMeshLine.trailMesh);
      this.linesHolder.push(tempTrailMeshLine);
    }
    this.scene.add(this.linesGroup);
    this.initMapAndLine = true;
  };

  this.update = function() {
    if (this.initMapAndLine && !this.guiParms.pause) {
      this.linesHolder.forEach(
        function(meahline) {
          meahline.update();
        }.bind(this)
      );
    }
  };
}

function Scene15MeshLine() {
  this.lineVerticesLength = 12.0;
  this.initLife = 120.0;
  this.getHead = function() {
    var tempW = dataW * scaleRate;
    var tempH = dataH * scaleRate;
    return new THREE.Vector3(
      (Math.random() * 2 - 1) * tempW * 0.5,
      (Math.random() * 2 - 1) * tempH * 0.5,
      0.0
    );
  };

  this.reset = function() {
    this.life = this.initLife;
    this.head = this.getHead();
    for (let index = 0; index < this.lineVerticesLength; index++) {
      this.trailLine.advance(this.head);
    }
  };
  this.checkBound = function() {
    return (
      Math.abs(this.head.x) > dataW * scaleRate * 0.5 ||
      Math.abs(this.head.y) > dataH * scaleRate * 0.5
    );
  };

  this.update = function() {
    var tempOffset = new THREE.Vector3(0, 0, 0);
    if (this.life < 0 - this.initLife) {
      this.reset();
    } else if (this.life < 0 || this.checkBound()) {
      this.life -= 5;
    } else {
      this.life -= 1;
      var dataX = Math.floor(this.head.x / scaleRate + dataW * 0.5);
      var dataY = Math.floor(this.head.y / scaleRate + dataH * 0.5);
      var dataVec = windsData.data[dataY * dataW + dataX];
      var dataScaleRate = 0.008;
      var tempOffset = new THREE.Vector3(
        dataVec[0] * dataScaleRate,
        dataVec[1] * dataScaleRate,
        0
      );

      // dynamic change color
      // console.log(tempOffset.length());
      // var tempH = Maf.map(0.0, 100.0, 0.0, 255.0, Math.random() * 100.0);
      var maxTempLen = 0.2;
      var tempL = Math.min(Math.max(tempOffset.length(), 0.0), maxTempLen);
      var tempH = Maf.map(maxTempLen, 0.0, 0.0, 100.0, tempL);
      this.trailMaterial.uniforms.color.value = new THREE.Color(
        "hsl(" + tempH + ", 190%, 50%)"
      );
      var tempW = Maf.map(0.0, maxTempLen, 0.004, 0.2, tempL);
      this.trailMaterial.uniforms.lineWidth.value = tempW;
      this.trailMaterial.uniformsNeedUpdate = true;
    }

    this.head.add(tempOffset);
    // console.log(this.trailLine.advance);
    this.trailLine.advance(this.head);
    // console.log(this.trailLine);

    // this.trailGeometry.advance
  };

  this.initMesh = function() {
    this.life = Math.floor((Math.random() + 1.0) * this.initLife);

    this.trailStartPos = this.getHead();
    this.head = this.trailStartPos;
    this.trailGeometry = new THREE.Geometry();
    for (var i = 0; i < this.lineVerticesLength; i++) {
      this.trailGeometry.vertices.push(this.trailStartPos);
    }

    this.trailLine = new MeshLine();
    this.trailLine.setGeometry(this.trailGeometry, function(p) {
      return 1 * Maf.parabola(p, 1);
    }); // makes width taper

    // color hue
    var tempH = Maf.map(0.0, 100.0, 0.0, 255.0, Math.random() * 100.0);

    this.trailMaterial = new MeshLineMaterial({
      color: new THREE.Color("hsl(" + tempH + ", 190%, 50%)"),
      // color:  new THREE.Color( 0xff00fff ),
      // opacity: 1,
      resolution: this.resolution,
      sizeAttenuation: 1,
      lineWidth: 0.1,
      near: 1,
      far: 100000,
      depthTest: false,
      // blending: THREE.AdditiveBlending,
      // transparent: true,
      side: THREE.DoubleSide
    });

    this.trailMesh = new THREE.Mesh(
      this.trailLine.geometry,
      this.trailMaterial
    ); // this syntax could definitely be improved!
    this.trailMesh.frustumCulled = false;
  };
  this.initMesh();
}

export default Scene15;
