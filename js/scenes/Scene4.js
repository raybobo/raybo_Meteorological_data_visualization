import Maf from '../model/maf.js';
// 三维定点箭头指示矢量场
function Scene4(params) {
  this.gridNum = 10;
  this.tempScale = 0.08;
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.initArrowMesh();
    this.addLight();
    this.addNoiseCube();
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

  this.initArrowMesh = function() {

    this.arrowGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
    this.arrowGeometry.rotateX(Math.PI * 0.5);

    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
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
    for (let i = -this.gridNum * 0.5; i < this.gridNum * 0.5 + 1; i++) {
      for (let j = -this.gridNum * 0.5; j < this.gridNum * 0.5 + 1; j++) {
        for (let k = -this.gridNum * 0.5; k < this.gridNum * 0.5 + 1; k++) {
          var cube = new THREE.Mesh(this.arrowGeometry, material);
          cube.position.set(i, j, k);

          // rotate by noise
          var tempAngle =
              this.noise.noise3D(i * this.tempScale, j * this.tempScale, 0);
          tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle);
          // console.log(tempAngle);
          var tempOffset = new THREE.Vector3(
              0 + 10 * Math.cos(tempAngle), 0 + 10 * Math.sin(tempAngle), 0);
          cube.lookAt(
              new THREE.Vector3(0, 0, 0).copy(cube.position).add(tempOffset));
          // cube.lookAt(new THREE.Vector3(0, 0, -5));
          this.scene.add(cube);
          this.cubeHolder.push({i: i, j: j, k: k, mesh: cube});
        }
      }
    }
  };
  this.arrowMeshUpdate = function(nowTime) {
    for (let index = 0; index < this.cubeHolder.length; index++) {
      var element = this.cubeHolder[index];
      var i = element.i;
      var j = element.j;
      var k = element.k;
      var cube = element.mesh;

      var tempAngle1 = this.noise.noise3D(
          i * this.tempScale, j * this.tempScale, nowTime * 0.3);
      tempAngle1 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle1);
      
      var tempAngle2 = this.noise.noise3D(
          j * this.tempScale, k * this.tempScale, nowTime * 0.3);
      tempAngle2 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle2);

      var tempOffset = new THREE.Vector3(
          Math.sin(tempAngle1) * Math.cos(tempAngle2), Math.sin(tempAngle1) * Math.sin(tempAngle2), Math.cos(tempAngle2));
      
      cube.lookAt(
          new THREE.Vector3(0, 0, 0).copy(cube.position).add(tempOffset));
      // cube.scale.x = tempOffset.x;
      // cube.scale.y = tempOffset.x;
      // cube.scale.z = tempOffset.x;
    }
  };

  this.update = function(nowTime) {
    this.arrowMeshUpdate(nowTime);
  };
}

export default Scene4;


// 2019/1/4
// - 使用两个noise 模拟的正确性？
// 方向性的表述
// 思路： 使用立方体，有六个颜色，可以调整朝向查看大小，与正方向吻合的面变大
