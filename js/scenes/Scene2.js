// 二维定点箭头指示矢量场
import * as THREE from "../libs_es6/three.module.js";
import Maf from "../module_es6/maf.js";
import SimplexNoise from "../module_es6/simplex-noise.js";
function Scene2(params) {
  this.gridNum = 10; // real : mult 2 add 1
  this.tempScale = 0.08;
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;
    this.initArrowGeometry();
    this.initArrowMesh();
    this.addLight();
    this.addNoiseCube();
    SceneController.scene = this.scene;
    SceneController.addHelper(10);

    
    SceneController.orbitControls.enabled = true;
    SceneController.cameraResetPos();
    
    SceneController.applyInfoTitleAndDetail(
      "场景二",
      "二维定点箭头 21 X 21 矩阵。\n" +
        "\n " +
        "通过 noise 函数模拟流场，基于每个箭头位置计算当前旋转角度。\n" +
        "添加摄像机轨道控制，" +
        "按下左键以坐标原点为中心旋转视角，" +
        "使用滚轮拉近拉远摄像机。\n" +
        "右上角图形界面可以调整灯光参数。"
    );
  };

  this.initSceneGUI = function(guiController) {
    this.guiParms = {
      arrowColor: "#ffae23",
      light1: 1.0,
      light2: 0.1,
      displayHelper : true
    };
    // console.log(guiController);
    this.guiFolder = guiController.gui.addFolder("Scene");
    // this.guiFolder.addColor(this.guiParms, "arrowColor").onChange(
    //   function(value) {
    //     for (let index = 0; index < this.cubeHolder.length; index++) {
    //       var element = this.cubeHolder[index];
    //       var cube = element.mesh;
    //       cube.material.color.set(value);
    //     }
    //   }.bind(this)
    // );
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "light1", 0.0, 2.0).onChange(
      function(value) {
        this.light1.intensity = value;
      }.bind(this)
    );
    this.guiFolder.add(this.guiParms, "light2", 0.0, 2.0).onChange(
      function(value) {
        this.light2.intensity = value;
      }.bind(this)
    );
    this.guiFolder.open();
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
    this.light1 = new THREE.DirectionalLight(0xffffff, 1.0);
    this.light1.position.set(1, 1, 1);
    this.scene.add(this.light1);

    this.light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    this.light2.position.set(-1, -1, 1);
    this.scene.add(this.light2);
    this.scene.add(new THREE.AmbientLight(0x666666));
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

    this.cubeHolder = [];
    for (let i = -this.gridNum; i < this.gridNum + 1; i++) {
      for (let j = -this.gridNum; j < this.gridNum + 1; j++) {
        var cube = new THREE.Mesh(this.arrowGeometry, material);
        cube.position.set(i, j, 0);

        // rotate by noise
        var tempAngle = this.noise.noise3D(
          i * this.tempScale,
          j * this.tempScale,
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
        this.cubeHolder.push({ i: i, j: j, mesh: cube });
      }
    }
  };
  this.arrowMeshUpdate = function(nowTime) {
    for (let index = 0; index < this.cubeHolder.length; index++) {
      var element = this.cubeHolder[index];
      var i = element.i;
      var j = element.j;
      var cube = element.mesh;
      var tempAngle = this.noise.noise3D(
        i * this.tempScale,
        j * this.tempScale,
        nowTime * 0.3
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
    }
  };

  this.update = function(nowTime) {
    this.arrowMeshUpdate(nowTime);
  };
}

export default Scene2;
