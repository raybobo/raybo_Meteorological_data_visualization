import * as THREE from "../libs_es6/three.module.js";
// 基本框架
function Scene1(params) {
  this.init = function(SceneController) {
    
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;
    this.addCube();
    this.addLight();
    SceneController.scene = this.scene;
    SceneController.addHelper(10);
    
    SceneController.orbitControls.enabled = true;
    SceneController.cameraResetPos();

    SceneController.applyInfoTitleAndDetail(
      "场景一",
      "场景基础框架。\n" +
      "\n" +
      "添加坐标轴，\n" +
      "添加摄像机轨道控制，可以按下左键以坐标原点为中心旋转视角，使用滚轮拉近拉远摄像机。\n" +
      "右上角图形界面可以选择是否显示坐标轴。"
    );
  };
  this.initSceneGUI = function(guiController) {
    // console.log(guiController);
    this.guiParms = {
      displayHelper : true
      // light1: 1.0,
      // light2: 0.1
    };
    this.guiFolder = guiController.gui.addFolder("Scene");
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder.open();
  }

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
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  };
  this.update = function() {};
}

export default Scene1;
