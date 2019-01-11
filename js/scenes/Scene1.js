import * as THREE from '../libs_es6/three.module.js';
// 基本框架
function Scene1(params) {
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
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  };
  this.update = function() {};
}

export default Scene1;
