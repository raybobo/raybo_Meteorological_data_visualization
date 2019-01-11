// import THREE from './libs_es6/three.js';
import OrbitControls from './libs_es6/THREE.OrbitControls.js';
import EffectComposer from './postprocessing_es6/EffectComposer.js';
import RenderPass from './postprocessing_es6/RenderPass.js';
import Scene1 from './scenes/Scene1.js';
import Scene2 from './scenes/Scene2.js';
import Scene3 from './scenes/Scene3.js';
import Scene4 from './scenes/Scene4.js';
import Scene5 from './scenes/Scene5.js';
import Scene6 from './scenes/Scene6.js';
import Scene7 from './scenes/Scene7.js';
import Scene8 from './scenes/Scene8.js';
import Scene9 from './scenes/Scene9.js';

function SceneController() {
  this.init = function() {
    this.threeSetup();

    this.sceneInit(9);

    this.postProcessingSetup();
  };

  this.threeSetup = function() {
    this.clock = new THREE.Clock();
    // scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0x000000);
    // renderer
    this.canvas = document.getElementById('target_canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth * 2, window.innerHeight * 2);

    // camera
    this.camera = new THREE.PerspectiveCamera(
        72, window.innerWidth / window.innerHeight, 0.1, 10000);

    // this.camera = new THREE.PerspectiveCamera(36, window.innerWidth /
    // window.innerHeight, 1, 10000); this.cameraRadius = 6.27;
    // this.cameraHeight = 1.24;
    // this.cameraTarget = new THREE.Vector3(0, this.cameraHeight - 0.16, 0);

    this.cameraRadius = 20;
    this.cameraHeight = 1.28;
    this.camera.position.set(0, this.cameraHeight, this.cameraRadius);
    // console.log(this.scene.position);

    this.cameraTarget = new THREE.Vector3(0, this.cameraHeight - 0.026, 0);
    this.camera.lookAt(this.cameraTarget);
  };
  this.sceneInit = function(input) {
    this.sceneRaybo = eval('new Scene' + input + '()');
    this.sceneRaybo.init(this);
    this.addHelper();
    this.addControls();
  };

  this.postProcessingSetup = function() {
    this.renderPass = new RenderPass(this.scene, this.camera);

    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    };

    this.renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
    this.renderPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer, this.renderTarget);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.composer.addPass(this.renderPass);
  };

  this.addControls = function() {
    // controls
    this.controls = new OrbitControls(this.camera);
  };

  this.addHelper = function() {
    this.axesHelper = new THREE.AxesHelper(10);
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(this.gridHelper);
    var loader = new THREE.FontLoader();
    loader.load(
        '../assets/fonts/helvetiker_regular.typeface.json', function(font) {
          var matLite = new THREE.MeshBasicMaterial({
            color: 0x006699,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
          });
          var message = 'Raybo';
          var shapes = font.generateShapes(message, 100);
          var geometry = new THREE.ShapeBufferGeometry(shapes);
          geometry.computeBoundingBox();
          var xMid =
              -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
          geometry.translate(xMid, 0, 0);
          geometry.scale(0.01, 0.01, 0.01);
          // make shape ( N.B. edge view not visible )
          var text = new THREE.Mesh(geometry, matLite);
          text.position.z = -5;
          // this.scene.add(text);
        }.bind(this));
  };



  this.update = function(nowTime) {
    const loopDuration = 16;
    const tmpVector = new THREE.Vector3();
    const tmpMat = new THREE.Matrix4();

    // const time = nowTime % loopDuration;
    // const t = time / loopDuration;
    this.sceneRaybo.update(nowTime);
  };

  this.render = function() {
    // console.log(performance.now());
    this.update(performance.now() * 0.001);

    this.renderer.render(this.scene, this.camera);
  };

  this.resize = function(width, height) {
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
export {SceneController};