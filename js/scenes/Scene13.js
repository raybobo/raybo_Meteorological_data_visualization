import * as THREE from '../libs_es6/three.module.js';
import { MeshLine, MeshLineMaterial } from '../module_es6/three-meshline.js';
import SimplexNoise from "../module_es6/simplex-noise.js";
// 三维 mesh line 游动
function Scene13(params) {
    this.init = function (SceneController) {
        this.scene = new THREE.Scene();
        this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.addLight();
        // reset camera
        this.camera = SceneController.camera;
        this.cameraRadius = 40;
        this.cameraHeight = 1.28;
        this.camera.position.set(0, this.cameraHeight, this.cameraRadius);
        SceneController.scene = this.scene;
        // noise
        this.noise = new SimplexNoise();
        this.lineVerticesLength = 100.0;
        this.lineCount = 30.0;
        this.bboxW = 20.0;
        this.addMeshLine();
        // reset helper

        // this.axesHelper = new THREE.AxesHelper(10);
        // this.scene.add(this.axesHelper);
        // this.gridHelper = new THREE.GridHelper(10, 10);
        // this.scene.add(this.gridHelper);

        SceneController.addHelper(20);
        this.axesHelper2 = new THREE.AxesHelper(40.0);
        this.scene.add(this.axesHelper2);
        this.axesHelper2.position.set(-20, -20, -20);

    };
    this.addMeshLine = function () {
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
            trailLine.setGeometry(trailGeometry, function (p) { return p; }); // makes width taper

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
                blending: THREE.AdditiveBlending,
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
    this.addLight = function () {
        // light
        var light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(1, 1, 1);
        this.scene.add(light1);

        var light2 = new THREE.DirectionalLight(0xffffff, 0.4);
        light2.position.set(-1, -1, 1);
        this.scene.add(light2);
        this.scene.add(new THREE.AmbientLight(0x666666));
    };
    this.checkOutOfMap = function (inLine) {
        var bbx = { max: new THREE.Vector3(this.bboxW, this.bboxW, this.bboxW), min: new THREE.Vector3(-this.bboxW, -this.bboxW, -this.bboxW) };
        // console.log(inPos);
        // world position
        var wp = new THREE.Vector3().copy(inLine.head).add(inLine.mesh.position);
        // console.log(bbx);


        if (wp.x < bbx.min.x) {
            inLine.mesh.position.x += (bbx.max.x - bbx.min.x);
        }
        if (wp.x > bbx.max.x) {
            inLine.mesh.position.x -= (bbx.max.x - bbx.min.x);
        }
        if (wp.y < bbx.min.y) {
            inLine.mesh.position.y += (bbx.max.y - bbx.min.y);
        }
        if (wp.y > bbx.max.y) {
            inLine.mesh.position.y -= (bbx.max.y - bbx.min.y);
        }
        if (wp.z < bbx.min.z) {
            inLine.mesh.position.z += (bbx.max.z - bbx.min.z);
        }
        if (wp.z > bbx.max.z) {
            inLine.mesh.position.z -= (bbx.max.z - bbx.min.z);
        }
    }

    this.update = function (nowTime) {
        this.linesHolder.forEach(function (element) {
            // console.log(element);
            // Advance the trail by one position
            var tempPar = 0.03;

            var tempAngle1 = this.noise.noise3D(
                element.head.x * tempPar, element.head.y * tempPar, nowTime * 0.3);
            tempAngle1 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle1);

            var tempAngle2 = this.noise.noise3D(
                element.head.y * tempPar, element.head.z * tempPar, nowTime * 0.3);
            tempAngle2 = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle2);

            var tempOffset = new THREE.Vector3(
                Math.sin(tempAngle1) * Math.cos(tempAngle2),
                Math.sin(tempAngle1) * Math.sin(tempAngle2), Math.cos(tempAngle2));

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
            this.checkOutOfMap(element);
        }.bind(this));

    };
}

export default Scene13;
