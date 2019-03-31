import * as THREE from "../libs_es6/three.module.js";
import { MeshLine, MeshLineMaterial } from "../module_es6/three-meshline.js";
import SimplexNoise from "../module_es6/simplex-noise.js";
// 三维 mesh line 游动
function Scene13(params) {
  this.init = function(SceneController) {
    this.scene = new THREE.Scene();
    this.sceneController = SceneController;
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.addLight();
    // reset camera pos
    SceneController.cameraResetPos();
    this.camera = SceneController.camera;
    this.cameraRadius = 40;
    this.cameraHeight = 1.28;
    this.camera.position.set(0, this.cameraHeight, this.cameraRadius);
    SceneController.scene = this.scene;

    
    SceneController.addHelper(20);
    SceneController.orbitControls.enabled = true;
    // SceneController.triggleHelper(false);
    SceneController.applyInfoTitleAndDetail(
      "场景十三",
      "三维线条标量场\n" +
        "\n " +
        "通过 noise 函数模拟流场，生成 100 条线条在其中运动，基于每条线条的头部位置来计算其下一步的旋转角度并步进，所有计算都是在 CPU 中进行的。\n" +
        "右上角图形界面可以暂停动画。"
    );


    // noise
    this.noise = new SimplexNoise();
    this.lineVerticesLength = 100.0;
    this.lineCount = 100.0;
    this.bboxW = 20.0;
    this.addMeshLine();
    // reset helper

    // this.axesHelper = new THREE.AxesHelper(10);
    // this.scene.add(this.axesHelper);
    // this.gridHelper = new THREE.GridHelper(10, 10);
    // this.scene.add(this.gridHelper);

    this.axesHelper2 = new THREE.AxesHelper(40.0);
    this.scene.add(this.axesHelper2);
    this.axesHelper2.position.set(-20, -20, -20);
  };
  this.initSceneGUI = function(guiController) {
    this.guiParms = {
      displayHelper: true,
      pause: false
    };
    this.guiFolder = guiController.gui.addFolder("Scene");
    this.guiFolder.add(this.guiParms, "displayHelper").onChange(
      function(value) {
        this.sceneController.triggleHelper(value);
      }.bind(this)
    );
    this.guiFolder
      .add(this.guiParms, "pause")
      .onChange(function(value) {}.bind(this));
    this.guiFolder.open();
  };
  this.addMeshLine = function() {
    this.linesHolder = [];
    this.linesGroup = new THREE.Group();
    for (let index = 0; index < this.lineCount; index++) {
      var trailStartPos = new THREE.Vector3(
        Math.random() * this.bboxW * 2.0 - this.bboxW,
        Math.random() * this.bboxW * 2.0 - this.bboxW,
        Math.random() * this.bboxW * 2.0 - this.bboxW
      );
      var trailGeometry = new THREE.Geometry();
      for (var i = 0; i < this.lineVerticesLength; i++) {
        trailGeometry.vertices.push(trailStartPos);
      }
      var trailLine = new MeshLine();
      trailLine.head = trailStartPos;
      trailLine.life = this.lineVerticesLength;
      trailLine.setGeometry(trailGeometry, function(p) {
        return p;
      }); // makes width taper

      var tempH = Maf.map(0.0, this.lineCount, 0.0, 255.0, index);
      // console.log(tempH);

      var trailMaterial = new MeshLineMaterial({
        color: new THREE.Color("hsl(" + tempH + ", 190%, 50%)"),
        resolution: this.resolution,
        sizeAttenuation: 1,
        lineWidth: 0.4,
        near: 1,
        far: 100000,
        depthTest: false,
        // blending: THREE.AdditiveBlending,
        transparent: false,
        side: THREE.DoubleSide
      });

      var tempTrailMesh = new THREE.Mesh(trailLine.geometry, trailMaterial); // this syntax could definitely be improved!
      tempTrailMesh.frustumCulled = false;

      this.linesGroup.add(tempTrailMesh);

      trailLine.mesh = tempTrailMesh;
      // console.log(this.trailLine.mesh);
      this.linesHolder.push(trailLine);
    }
    // console.log(tempTrailMesh);

    this.scene.add(this.linesGroup);

    this.initMapAndLine = true;
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
  this.checkOutOfMap = function(inLine) {
    var bbx = {
      max: new THREE.Vector3(this.bboxW, this.bboxW, this.bboxW),
      min: new THREE.Vector3(-this.bboxW, -this.bboxW, -this.bboxW)
    };
    // console.log(inPos);
    // world position
    // var wp = new THREE.Vector3().copy(inLine.head).add(inLine.mesh.position);
    // console.log(bbx);

    if (inLine.life < 0.0) {
      inLine.life = this.lineVerticesLength;
      inLine.head = new THREE.Vector3(
        Math.random() * 50.0 - 25.0,
        Math.random() * 50.0 - 25.0,
        0.0
      );
      for (let index = 0; index < this.lineVerticesLength; index++) {
        // this.trailLine.advance(this.head);
        inLine.advance(inLine.head);
      }
    }

    var head = new THREE.Vector3().copy(inLine.head);
    if (
      head.x < bbx.min.x ||
      head.x > bbx.max.x ||
      head.y < bbx.min.y ||
      head.y > bbx.max.y ||
      head.z < bbx.min.z ||
      head.z > bbx.max.z
    ) {
      inLine.life--;
      inLine.advance(head);
      return true;
    }
    // if (wp.x < bbx.min.x) {
    //   inLine.mesh.position.x += bbx.max.x - bbx.min.x;
    // }
    // if (wp.x > bbx.max.x) {
    //   inLine.mesh.position.x -= bbx.max.x - bbx.min.x;
    // }
    // if (wp.y < bbx.min.y) {
    //   inLine.mesh.position.y += bbx.max.y - bbx.min.y;
    // }
    // if (wp.y > bbx.max.y) {
    //   inLine.mesh.position.y -= bbx.max.y - bbx.min.y;
    // }
    // if (wp.z < bbx.min.z) {
    //   inLine.mesh.position.z += bbx.max.z - bbx.min.z;
    // }
    // if (wp.z > bbx.max.z) {
    //   inLine.mesh.position.z -= bbx.max.z - bbx.min.z;
    // }
  };

  this.update = function(nowTime) {
    if (!this.guiParms.pause) {
      this.linesHolder.forEach(
        function(element) {
          if (this.checkOutOfMap(element)) {
            return;
          }
          // console.log(element);
          // Advance the trail by one position
          var tempPar = 0.03;

          var tempAngle1 = this.noise.noise3D(
            element.head.x * tempPar,
            element.head.y * tempPar,
            nowTime * 0.3
          );
          tempAngle1 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle1);

          var tempAngle2 = this.noise.noise3D(
            element.head.y * tempPar,
            element.head.z * tempPar,
            nowTime * 0.3
          );
          tempAngle2 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle2);

          var tempOffset = new THREE.Vector3(
            Math.sin(tempAngle1) * Math.cos(tempAngle2),
            Math.sin(tempAngle1) * Math.sin(tempAngle2),
            Math.cos(tempAngle2)
          );

          // tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle);

          // var tempOffset = new THREE.Vector3(
          //     0 + 0.2 * Math.cos(tempAngle),
          //     0 + 0.2 * Math.sin(tempAngle),
          //     0
          // );
          // console.log(element.head);
          tempOffset.normalize();
          element.head.add(tempOffset.multiplyScalar(0.2));

          element.advance(element.head);
        }.bind(this)
      );
    }
  };
}

export default Scene13;
