import * as THREE from './libs_es6/three.module.js';
import OrbitControls from './module_es6/controls/THREE.OrbitControls.js';
import EffectComposer from './module_es6/postprocessing/THREE.EffectComposer.js';
import RenderPass from './module_es6/postprocessing/THREE.RenderPass.js';
import Scene1 from './scenes/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';
import Scene4 from './scenes/Scene4.js';
import Scene5 from './scenes/Scene5.js';
import Scene6 from './scenes/Scene6.js';
import Scene7 from './scenes/Scene7.js';
import Scene8 from './scenes/Scene8.js';
import Scene9 from './scenes/Scene9.js';
import Scene10 from './scenes/Scene10.js';
import Scene11 from './scenes/Scene11.js';
import Scene12 from './scenes/Scene12.js';
import Scene13 from './scenes/Scene13.js';
import Scene14 from './scenes/Scene14.js';
import Scene15 from './scenes/Scene15.js';

function SceneController() {
  this.init = function (initSceneIndex) {
    this.threeSetup();

    this.sceneInit(initSceneIndex);

    this.addControls();
    this.postProcessingSetup();
  };

  this.threeSetup = function () {
    this.clock = new THREE.Clock();
    // scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0x000000);
    // renderer
    this.canvas = document.getElementById('target_canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // camera
    this.camera = new THREE.PerspectiveCamera(
      72, window.innerWidth / window.innerHeight, 0.1, 10000);

    this.cameraRadius = 20;
    this.cameraHeight = 1.28;
    this.camera.position.set(0, this.cameraHeight, this.cameraRadius);

    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.cameraTarget);
  };
  this.sceneInit = function (input) {
    
    this.sceneHolder = {};
    this.sceneHolder.s1 = Scene1;
    this.sceneHolder.s2 = Scene2;
    this.sceneHolder.s3 = Scene3;
    this.sceneHolder.s4 = Scene4;
    this.sceneHolder.s5 = Scene5;
    this.sceneHolder.s5 = Scene5;
    this.sceneHolder.s6 = Scene6;
    this.sceneHolder.s7 = Scene7;
    this.sceneHolder.s8 = Scene8;
    this.sceneHolder.s9 = Scene9;
    this.sceneHolder.s10 = Scene10;
    this.sceneHolder.s11 = Scene11;
    this.sceneHolder.s12 = Scene12;
    this.sceneHolder.s13 = Scene13;
    this.sceneHolder.s14 = Scene14;
    this.sceneHolder.s15 = Scene15;

    var nowScene = Object.values(this.sceneHolder)[input - 1];
    this.sceneRaybo = new nowScene();
    this.sceneRaybo.init(this);

  };

  this.postProcessingSetup = function () {
    this.renderPass = new RenderPass(this.scene, this.camera);

    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };

    this.renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
    this.renderPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer, this.renderTarget);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.composer.addPass(this.renderPass);
  };

  this.addControls = function () {
    // controls
    this.controls = new OrbitControls(this.camera);
  };

  this.addHelper = function (width) {
    this.axesHelper = new THREE.AxesHelper(width);
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(width, width);
    this.scene.add(this.gridHelper);
    var loader = new THREE.FontLoader();
    // loader.load(
    //     '../assets/fonts/helvetiker_regular.typeface.json', function(font) {
    //       var matLite = new THREE.MeshBasicMaterial({
    //         color: 0x006699,
    //         transparent: true,
    //         opacity: 0.4,
    //         side: THREE.DoubleSide
    //       });
    //       var message = 'Raybo';
    //       var shapes = font.generateShapes(message, 100);
    //       var geometry = new THREE.ShapeBufferGeometry(shapes);
    //       geometry.computeBoundingBox();
    //       var xMid =
    //           -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    //       geometry.translate(xMid, 0, 0);
    //       geometry.scale(0.01, 0.01, 0.01);
    //       // make shape ( N.B. edge view not visible )
    //       var text = new THREE.Mesh(geometry, matLite);
    //       text.position.z = -5;
    //       // this.scene.add(text);
    //     }.bind(this));
  };

  this.update = function (nowTime) {
    const loopDuration = 16;
    const tmpVector = new THREE.Vector3();
    const tmpMat = new THREE.Matrix4();

    // const time = nowTime % loopDuration;
    // const t = time / loopDuration;
    this.sceneRaybo.update(nowTime);
  };

  this.render = function () {
    // console.log(performance.now());
    this.update(performance.now() * 0.001);

    this.renderer.render(this.scene, this.camera);
  };

  this.resize = function (width, height) {
    // camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // render
    this.renderer.setSize(width, height);
    var pixelRatio = this.renderer.getPixelRatio();
    var newWidth = Math.floor(width / pixelRatio) || 1;
    var newHeight = Math.floor(height / pixelRatio) || 1;
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  };
}
export { SceneController };
