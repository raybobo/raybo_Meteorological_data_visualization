import * as THREE from '../libs_es6/three.module.js';
import Maf from "../module_es6/maf.js";

import { MeshLine, MeshLineMaterial } from '../module_es6/three-meshline.js';
import { ConstantSpline } from '../module_es6/three-constantSpline.js';

import SimplexNoise from "../module_es6/simplex-noise.js";
// 基本框架
function Scene12(params) {
  this.init = function (SceneController) {
    this.scene = new THREE.Scene();
    this.renderer = SceneController.renderer;
    this.camera = SceneController.camera;
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    // reset camera
    this.cameraRadius = 50;
    this.cameraHeight = 1.28;
    this.camera.position.set(0, this.cameraHeight, this.cameraRadius);
    //
    this.WIDTH = 128;
    this.initLineMaterialForMap();
    this.addLight();
    SceneController.scene = this.scene;


    // noise

    this.noise = new SimplexNoise();

    // add world map mesh 
    // add mesh line 
    // set flag
    this.readSVG()
      .then(this.drawSVG.bind(this));
    // .then(this.addMeshLine.bind(this));

    this.lineVerticesLength = 100.0;
    this.lineCount = 100.0;
    this.addMeshLine();
    //
  };
  this.addMeshLine = function () {
    this.linesHolder = [];
    this.linesGroup = new THREE.Group();
    for (let index = 0; index < this.lineCount; index++) {

      var trailStartPos = new THREE.Vector3(Math.random() * 50.0 - 25.0, Math.random() * 50.0 - 25.0, 0.0);
      var trailGeometry = new THREE.Geometry();
      for (var i = 0; i < this.lineVerticesLength; i++) {
        trailGeometry.vertices.push(trailStartPos);
      }
      var trailLine = new MeshLine();
      trailLine.head = trailStartPos;
      trailLine.setGeometry(trailGeometry, function (p) { return p; }); // makes width taper

      var tempH = Maf.map(0.0, 100.0, 0.0, 255.0, index);
      // console.log(tempH);
       
      var trailMaterial = new MeshLineMaterial({
        color: new THREE.Color("hsl(" + tempH + ", 190%, 50%)"),
        opacity: 1,
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
  this.initLineMaterialForMap = function () {
    this.mapLineMaterial = new MeshLineMaterial({
      // map: THREE.ImageUtils.loadTexture('assets/stroke.png'),
      useMap: false,
      color: new THREE.Color(1, 1, 1),
      opacity: 1,
      resolution: this.resolution,
      sizeAttenuation: false,
      lineWidth: 1,
      near: this.camera.near,
      far: this.camera.far,
      depthWrite: false,
      depthTest: false,
      transparent: true
    });
  };
  this.readSVG = function () {

    return new Promise(function (resolve, reject) {
      var ajax = new XMLHttpRequest();
      ajax.open("GET", "assets/worldLow.svg", true);
      ajax.send();
      ajax.addEventListener('load', function (e) {
        resolve(ajax.responseText);
      });
    });

  };
  this.drawSVG = function (source) {
    // console.log(source);
    var lines = [];
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, "image/svg+xml");
    var pathNodes = doc.querySelectorAll('path');

    [].forEach.call(pathNodes, function (p) {

      if (p instanceof SVGPathElement && p.pathSegList) {

        var line = new THREE.Geometry();
        var vertices = line.vertices;
        var x, y;
        var ox, oy;
        var px, py;

        var segments = p.pathSegList;
        for (var i = 0; i < segments.numberOfItems; i++) {

          var segment = segments.getItem(i);

          var types = [SVGPathSegMovetoAbs, SVGPathSegLinetoRel, SVGPathSegLinetoVerticalRel, SVGPathSegLinetoHorizontalRel, SVGPathSegLinetoHorizontalAbs, SVGPathSegLinetoVerticalAbs, SVGPathSegClosePath, SVGPathSegLinetoAbs];
          var found = false;
          types.forEach(function (t) {
            if (segment instanceof t) {
              found = true;
            }
          });
          if (!found) {
            console.log(segment);
          }

          if (segment instanceof SVGPathSegMovetoAbs) {
            x = segment.x;
            y = segment.y;
            ox = x;
            oy = y;
            // add line;
            lines.push(line);
            line = new THREE.Geometry();
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoRel) {
            x = px + segment.x;
            y = py + segment.y;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoAbs) {
            x = segment.x;
            y = segment.y;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoVerticalRel) {
            x = px;
            y = py + segment.y;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoHorizontalRel) {
            x = px + segment.x;
            y = py;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoHorizontalAbs) {
            x = segment.x;
            y = py;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegLinetoVerticalAbs) {
            x = px;
            y = segment.y;
            line.vertices.push(new THREE.Vector3(x, y, 0));
          }
          if (segment instanceof SVGPathSegClosePath) {
            x = ox;
            y = oy;
            line.vertices.push(new THREE.Vector3(x, y, 0));
            // add line
            lines.push(line);
            line = new THREE.Geometry();
          }

          px = x;
          py = y;

        }

      }

    });

    this.mapLinesHolder = new THREE.Group();
    lines.forEach(function (l) {
      this.makeLine(l);
    }.bind(this));
    this.mapLinesHolder.scale.set(0.1, 0.1, 0.1);
    this.mapLinesHolder.rotation.y = -Math.PI * 0.5;
    this.scene.add(this.mapLinesHolder);

    this.mapBoxHelper = new THREE.BoxHelper(this.mapLinesHolder);
    this.mapBoxHelper.geometry.computeBoundingBox();
    this.scene.add(this.mapBoxHelper);

    // console.log(this.mapBoxHelper);
  }

  this.makeLine = function (geo) {

    var g = new MeshLine();
    g.setGeometry(geo);

    var mesh = new THREE.Mesh(g.geometry, this.mapLineMaterial);
    mesh.position.z += 500;
    mesh.position.y += 300;
    mesh.rotation.y = -Math.PI / 2;
    mesh.rotation.z = Math.PI;
    this.mapLinesHolder.add(mesh);
    // this.mapLinesHolder.add( new THREE.BoxHelper( mesh ) );

    return mesh;


  }

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
    if (!this.mapBoxHelper) return;
    var bbx = this.mapBoxHelper.geometry.boundingBox;
    // console.log(inPos);
    // world position
    var wp = new THREE.Vector3().copy(inLine.head).add(inLine.mesh.position);

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




    //   ||  ||
    //   inPos.y < bbx.min.y || inPos.y > bbx.max.y
    // ) {
    // console.log("Ffffff");
    // }
  };

  this.update = function () {
    if (this.initMapAndLine) {
      this.linesHolder.forEach(function (element) {
        // console.log(element);
        // Advance the trail by one position
        var tempPar = 0.2;
        var tempAngle = this.noise.noise3D(
          element.head.x * tempPar,
          element.head.y * tempPar,
          performance.now() * 0.001
        );
        tempAngle = Maf.map(-1.0, 1.0, -Math.PI, Math.PI, tempAngle);

        var tempOffset = new THREE.Vector3(
          0 + 0.2 * Math.cos(tempAngle),
          0 + 0.2 * Math.sin(tempAngle),
          0
        );
        // console.log(element.head);

        element.head.add(tempOffset);
        element.advance(element.head);
        this.checkOutOfMap(element);
      }.bind(this));


    }
  };
}

export default Scene12;
