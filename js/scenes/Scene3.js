// 二维运动箭头指示矢量场
import * as THREE from '../libs_es6/three.module.js';
import Maf from "../module_es6/maf.js";
import SimplexNoise from "../module_es6/simplex-noise.js";
function Scene2(params) {
  this.arrowNum = 3000;
  this.gridNum = 20;
  this.tempScale = 0.08;
  this.moveSpeed = 0.05;
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.initArrowGeometry();
    this.initArrowMesh();
    this.addLight();
    this.addBorder();
    this.addNoiseCube();
    SceneController.scene = this.scene;
    SceneController.addHelper(10);
  };

  this.addBorder = function() {
    // LR
    var geometry = new THREE.BoxGeometry(2.0, this.gridNum + 2.0, 1.0);
    var material = new THREE.MeshStandardMaterial({ color: 0x666666 });
    var cubeL = new THREE.Mesh(geometry, material);
    cubeL.position.x = -this.gridNum * 0.5;
    var cubeR = cubeL.clone();
    cubeR.position.x = this.gridNum * 0.5;
    // UD
    geometry = new THREE.BoxGeometry(this.gridNum + 2.0, 2.0, 1.0);
    material = new THREE.MeshStandardMaterial({ color: 0x666666 });
    var cubeU = new THREE.Mesh(geometry, material);
    cubeU.position.y = -this.gridNum * 0.5;
    var cubeD = cubeU.clone();
    cubeD.position.y = this.gridNum * 0.5;

    this.scene.add(cubeL);
    this.scene.add(cubeR);
    this.scene.add(cubeU);
    this.scene.add(cubeD);
  };

  this.initArrowGeometry = function() {
    var x = 0,
      y = 0;
    var extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1
    };

    this.arrowShape = new THREE.Shape();
    this.arrowShape.moveTo(x, y);
    this.arrowShape.lineTo(x + 3, y - 5);
    this.arrowShape.lineTo(x + 1, y - 5);
    this.arrowShape.lineTo(x + 1, y - 10);
    this.arrowShape.lineTo(x - 1, y - 10);
    this.arrowShape.lineTo(x - 1, y - 5);
    this.arrowShape.lineTo(x - 3, y - 5);

    this.arrowGeometry = new THREE.ExtrudeBufferGeometry(
      this.arrowShape,
      extrudeSettings
    );
  };
  this.addLight = function() {
    // light
    var light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    this.scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-1, -1, 1);
    this.scene.add(light2);
    this.scene.add(new THREE.AmbientLight(0xaaaaaa));
  };

  this.initArrowMesh = function() {
    // this.arrowGeometry.computeBoundingBox();
    // var bbx = this.arrowGeometry.boundingBox;
    // var xMid = 0.5 * (bbx.max.x - bbx.min.x);
    // var yMid = 0.5 * (bbx.max.y - bbx.min.y);
    // var zMid = -0.5 * (bbx.max.z - bbx.min.z);
    // this.arrowGeometry.translate(0, yMid, zMid);
    // this.arrowGeometry.translate(0, 10, 0);
    // this.arrowGeometry.scale(0.1, 0.1, 0.1);
    // this.arrowGeometry.rotateX(Math.PI * 0.5);

    // this.arrowGeometry.rotateY(Math.PI * 0.25);
    // this.arrowGeometry.rotateZ(Math.PI * 0.25);

    this.arrowGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    this.arrowGeometry.rotateX(Math.PI * 0.5);

    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff
      // wireframe: true,
      // map:
    });

    this.arrowMesh = new THREE.Mesh(this.arrowGeometry, material);

    // this.scene.add(this.arrowMesh);
    // this.arrowMesh.lookAt(new THREE.Vector3(10, -10, -10));
  };
  this.addNoiseCube = function() {
    this.noise = new SimplexNoise();
    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff
      // wireframe: true,
      // map:
    });

    this.arrowHolder = [];
    for (let i = 0; i < this.arrowNum; i++) {
      var tx = Maf.randomInRange(-this.gridNum * 0.5, this.gridNum * 0.5);
      var ty = Maf.randomInRange(-this.gridNum * 0.5, this.gridNum * 0.5);
      var cube = new THREE.Mesh(this.arrowGeometry, material);
      cube.position.set(tx, ty, 0);

      // rotate by noise
      var tempAngle = this.noise.noise3D(
        tx * this.tempScale,
        ty * this.tempScale,
        0
      );
      tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle);
      // console.log(tempAngle);
      var tempOffset = new THREE.Vector3(
        0 + 10 * Math.cos(tempAngle),
        0 + 10 * Math.sin(tempAngle),
        0
      );
      cube.lookAt(
        new THREE.Vector3(0, 0, 0).copy(cube.position).add(tempOffset)
      );
      // cube.lookAt(new THREE.Vector3(0, 0, -5));
      this.scene.add(cube);
      this.arrowHolder.push({ mesh: cube });
    }
  };
  this.arrowMeshUpdate = function(nowTime) {
    for (let index = 0; index < this.arrowHolder.length; index++) {
      var element = this.arrowHolder[index];
      var i = element.mesh.position.x;
      var j = element.mesh.position.y;
      var cube = element.mesh;

      // if over grid, reset position
      if (
        Math.abs(i) > this.gridNum * 0.5 ||
        Math.abs(j) > this.gridNum * 0.5
      ) {
        cube.position.x = Maf.randomInRange(
          -this.gridNum * 0.5,
          this.gridNum * 0.5
        );
        cube.position.y = Maf.randomInRange(
          -this.gridNum * 0.5,
          this.gridNum * 0.5
        );

        i = element.mesh.position.x;
        j = element.mesh.position.y;
      }

      var tempAngle = this.noise.noise3D(
        i * this.tempScale,
        j * this.tempScale,
        nowTime * 0.05
      );
      tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle);
      var tempOffset = new THREE.Vector3(
        0 + 10 * Math.cos(tempAngle),
        0 + 10 * Math.sin(tempAngle),
        0
      );
      cube.lookAt(
        new THREE.Vector3(0, 0, 0).copy(cube.position).add(tempOffset)
      );
      cube.position.add(tempOffset.normalize().multiplyScalar(this.moveSpeed));
    }
  };

  this.update = function(nowTime) {
    this.arrowMeshUpdate(nowTime);
  };
}

export default Scene2;
