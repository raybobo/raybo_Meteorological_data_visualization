// 三维定点矩形指示矢量场
function Scene5(params) {
  this.gridNum = 10;
  this.tempNoiseScale = 0.08;
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.initCube();
    this.addNoiseCube();
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
    this.scene.add(new THREE.AmbientLight(0xffffff));
  };

  this.initCube = function() {
    var geometry = new THREE.BoxBufferGeometry(0.6, 0.6, 0.6);
    var count = geometry.attributes.position.count;
    geometry.addAttribute(
        'color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

    var colors = geometry.attributes.color;
    var color = new THREE.Color();
    for (var i = 0; i < count; i++) {
      color.setHSL(Math.floor(i * 6.0 / count) / 6.0, 1.0, 0.5);
      colors.setXYZ(i, color.r, color.g, color.b);
    }

    var material = new THREE.MeshPhongMaterial({
      vertexColors: THREE.VertexColors,
      flatShading: true,
      shininess: 0,  //
      // transparent: true,
      // opacity: 0.6
    });
    this.cube = new THREE.Mesh(geometry, material);


    // this.scene.add(this.cube);
  };

  this.addNoiseCube = function() {
    this.noise = new SimplexNoise();
    this.cubeHolder = [];
    for (let i = -this.gridNum * 0.5; i < this.gridNum * 0.5 + 1; i++) {
      for (let j = -this.gridNum * 0.5; j < this.gridNum * 0.5 + 1; j++) {
        for (let k = -this.gridNum * 0.5; k < this.gridNum * 0.5 + 1; k++) {
          // for (let k = 0; k < 1; k++) {
          var cube = this.cube.clone();
          cube.position.set(i, j, k);

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

      // noise rotate using two angle, Euler's rotation theorem
      var tempAngle1 = this.noise.noise3D(
          i * this.tempNoiseScale, j * this.tempNoiseScale, nowTime * 0.3);
      tempAngle1 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle1);

      var tempAngle2 = this.noise.noise3D(
          j * this.tempNoiseScale, k * this.tempNoiseScale, nowTime * 0.3);
      tempAngle2 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle2);

      var tempOffset = new THREE.Vector3(
          Math.sin(tempAngle1) * Math.cos(tempAngle2),
          Math.sin(tempAngle1) * Math.sin(tempAngle2), Math.cos(tempAngle2));
      tempOffset.normalize();

      // convert to quaternion to avoid gimbal lock

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(tempOffset, Math.PI / 2);
      cube.quaternion.copy(quaternion);  //.normalize();

      // set scale by the angle to camera
      // if (index == 1) {
      // var quaternion2 = new THREE.Quaternion();
      // quaternion2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      // var tempX = cube.quaternion.angleTo(quaternion2);
      // tempX = Maf.map(0, Math.PI * 2.0, 0.0, 1.0, tempX);
      // console.log(tempX);
      // cube.scale.z = tempX;
      // }
    }
  };

  this.update = function(nowTime) {
    this.arrowMeshUpdate(nowTime);
    // console.log("??");
  };
}

export default Scene5;
