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
    SceneController.scene = this.scene;
    SceneController.addHelper(10);

    this.addVectorVisualPlane();
    this.addLight();
    this.lineCount = 2000.0;
    this.addMeshLine();
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
      "./../../assets/data/windsPng/rg.png"
      // "./../../assets/data/windsPng/g.png"
    );
    texture.flipY = false;
    console.log(texture);
    
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture
    });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
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
    if (this.initMapAndLine) {
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
    if (this.life < 0 || this.checkBound()) {
      this.reset();
    }
    
    this.life--;

    var dataX = Math.floor(this.head.x / scaleRate + dataW * 0.5);
    var dataY = Math.floor(this.head.y / scaleRate + dataH * 0.5);
    var dataVec = windsData.data[dataY * dataW + dataX];

    

    // this.headAngle = 0.1;
    // this.tempAngle = Math.random() * 2.0 - 1.0;
    // this.tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, this.tempAngle);
    // var tempOffset = new THREE.Vector3(
    //   0 + 0.2 * Math.cos(this.tempAngle),
    //   0 + 0.2 * Math.sin(this.tempAngle),
    //   0
    // );
    var dataScaleRate = 0.004;
    var tempOffset = new THREE.Vector3(
      dataVec[0] * dataScaleRate,
      dataVec[1] * dataScaleRate,
      0
    );


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
      return 1 * Maf.parabola( p, 1 );
    }); // makes width taper

    // color hue
    var tempH = Maf.map(0.0, 100.0, 0.0, 255.0, Math.random() * 100.0);

    this.trailMaterial = new MeshLineMaterial({
      color: new THREE.Color("hsl(" + tempH + ", 190%, 50%)"),
      // opacity: 1,
      resolution: this.resolution,
      sizeAttenuation: 1,
      lineWidth: 0.1,
      near: 1,
      far: 100000,
      depthTest: false,
      blending: THREE.AdditiveBlending,
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
