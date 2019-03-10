import * as THREE from '../libs_es6/three.module.js';
import GPUComputationRenderer from '../module_es6/GPUComputationRenderer.js';
import SimplexNoise from '../module_es6/simplex-noise.js';

import heightmapFragmentShader from './gpgpuwater/heightmapFragmentShader.js';
import readWaterLevelFragmentShader from './gpgpuwater/readWaterLevelFragmentShader.js';
import smoothFragmentShader from './gpgpuwater/smoothFragmentShader.js';
import waterVertexShader from './gpgpuwater/waterVertexShader.js';

// webgl_gpgpu_water example
function Scene10(params) {
  this.init = function(SceneController) {
    this.renderer = SceneController.renderer;
    this.camera = SceneController.camera;
    this.scene = new THREE.Scene();
    this.initStatic();
    this.addWaterMesh();
    this.addRayCastingMesh();
    this.initGpuCompute();
    // this.addGpgpuShader();
    // this.createSpheres();
    this.addVisualPlane();
    this.addLight();
    this.setMouseEvent();
    SceneController.scene = this.scene;
    SceneController.addHelper(10);
  };
  this.initStatic = function() {
    this.WIDTH = 128;
    this.BOUNDS = 512;
    this.BOUNDS_HALF = this.BOUNDS * 0.5;
    this.simplex = new SimplexNoise();
    this.raycaster = new THREE.Raycaster();
    this.mouseCoords = new THREE.Vector2();
  };
  this.addLight = function() {
    // light
    var light1 = new THREE.DirectionalLight(0xffffff, 2);
    light1.position.set(1, 3, 4);
    this.scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-1, -1, 1);
    this.scene.add(light2);
    this.scene.add(new THREE.AmbientLight(0x666666));
  };

  this.addVisualPlane = function() {
    var geometry =
        new THREE.PlaneBufferGeometry(this.WIDTH * 0.1, this.WIDTH * 0.1, 1);
    var material = new THREE.MeshBasicMaterial({map: null, side:THREE.DoubleSide});
    // var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.visualPlane = new THREE.Mesh(geometry, material);
    this.visualPlane.position.y += this.WIDTH * 0.05;
    this.visualPlane.position.z -= this.WIDTH * 0.1;
    this.scene.add(this.visualPlane);
  };

  this.addWaterMesh = function() {
    var materialColor = 0x0040c0;
    var geometry = new THREE.PlaneBufferGeometry(
        this.BOUNDS * 0.05, this.BOUNDS * 0.05, this.WIDTH - 1, this.WIDTH - 1);
    // material: make a ShaderMaterial clone of MeshPhongMaterial, with
    // customized vertex shader

    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge(
          [THREE.ShaderLib['phong'].uniforms, {heightmap: {value: null}}]),
      vertexShader: waterVertexShader,
      fragmentShader: THREE.ShaderChunk['meshphong_frag']
    });
    material.lights = true;
    // Material attributes from MeshPhongMaterial
    material.color = new THREE.Color(materialColor);
    material.specular = new THREE.Color(0xffffff);
    material.shininess = 100;
    // Sets the uniforms with the material values
    material.uniforms.diffuse.value = material.color;
    material.uniforms.specular.value = material.specular;
    material.uniforms.shininess.value = Math.max(material.shininess, 1e-4);
    material.uniforms.opacity.value = material.opacity;
    
    // Defines
    material.defines.WIDTH = this.WIDTH.toFixed(1);
    material.defines.BOUNDS = this.BOUNDS.toFixed(1);

    this.waterUniforms = material.uniforms;

    this.waterMesh = new THREE.Mesh(geometry, material);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();

    this.waterMesh.material.wireframe = true;
    this.scene.add(this.waterMesh);
  };
  this.addRayCastingMesh = function() {
    var geometryRay =
        new THREE.PlaneBufferGeometry(this.BOUNDS, this.BOUNDS, 1, 1);
    this.meshRay = new THREE.Mesh(
        geometryRay,
        new THREE.MeshBasicMaterial({color: 0xffffff, visible: false}));
    this.meshRay.rotation.x = -Math.PI / 2;
    this.meshRay.matrixAutoUpdate = false;
    this.meshRay.updateMatrix();
    this.scene.add(this.meshRay);
  };
  this.initGpuCompute = function() {
    // Creates the gpu computation class and sets it up

    this.gpuCompute =
        new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);

    var heightmap0 = this.gpuCompute.createTexture();
    this.fillTexture(heightmap0);
    this.heightmapVariable = this.gpuCompute.addVariable(
        'heightmap', heightmapFragmentShader, heightmap0);
    this.gpuCompute.setVariableDependencies(
        this.heightmapVariable, [this.heightmapVariable]);

    this.heightmapVariable.material.uniforms.mousePos = {
      value: new THREE.Vector2(10000, 10000)
    };
    this.heightmapVariable.material.uniforms.mouseSize = {value: 20.0};
    this.heightmapVariable.material.uniforms.viscosityConstant = {value: 0.98};
    this.heightmapVariable.material.uniforms.heightCompensation = {value: 0};
    this.heightmapVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(1);

    var error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  };

  this.addGpgpuShader = function() {
    // Create compute shader to smooth the water surface and velocity
    this.smoothShader = this.gpuCompute.createShaderMaterial(
        smoothFragmentShader, {texture: {value: null}});
    // Create compute shader to read water level
    this.readWaterLevelShader = this.gpuCompute.createShaderMaterial(
        readWaterLevelFragmentShader,
        {point1: {value: new THREE.Vector2()}, texture: {value: null}});
    this.readWaterLevelShader.defines.WIDTH = this.WIDTH.toFixed(1);
    this.readWaterLevelShader.defines.BOUNDS = this.BOUNDS.toFixed(1);
    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte
    // per channel) to read water height and orientation
    this.readWaterLevelImage = new Uint8Array(4 * 1 * 4);
    this.readWaterLevelRenderTarget = new THREE.WebGLRenderTarget(4, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: false
    });
  };
  this.createSpheres = function() {
    var sphereTemplate = new THREE.Mesh(
        new THREE.SphereBufferGeometry(4, 24, 12),
        new THREE.MeshPhongMaterial({color: 0xffff00}));
    for (var i = 0; i < 12; i++) {
      var sphere = sphereTemplate;
      if (i < 12 - 1) {
        sphere = sphereTemplate.clone();
      }
      sphere.position.x = (Math.random() - 0.5) * this.BOUNDS * 0.7;
      sphere.position.z = (Math.random() - 0.5) * this.BOUNDS * 0.7;
      sphere.userData.velocity = new THREE.Vector3();
      this.scene.add(sphere);
      // spheres[i] = sphere;
    }
  };
  this.fillTexture = function(texture) {
    var waterMaxHeight = 10;
    // function noise(x, y) {
    //   var multR = waterMaxHeight;
    //   var mult = 0.025;
    //   var r = 0;
    //   for (var i = 0; i < 15; i++) {
    //     r += multR * this.simplex.noise2D(x * mult, y * mult);
    //     multR *= 0.53 + 0.025 * i;
    //     mult *= 1.25;
    //   }
    //   return r;
    // }
    var pixels = texture.image.data;
    var p = 0;
    for (var j = 0; j < this.WIDTH; j++) {
      for (var i = 0; i < this.WIDTH; i++) {
        var x = (i * 10) / this.WIDTH;
        var y = (j * 10) / this.WIDTH;
        pixels[p + 0] = this.simplex.noise3D(x, y, 123.4);
        pixels[p + 1] = pixels[p + 0];
        pixels[p + 2] = 0;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  };
  this.setMouseEvent = function() {
    // document.addEventListener('mousemove', this.onDocumentMouseMove, false);
  };
  this.setMouseCoords = function(x, y) {
    mouseCoords.set(
        (x / renderer.domElement.clientWidth) * 2 - 1,
        -(y / renderer.domElement.clientHeight) * 2 + 1);
    this.mouseMoved = true;
  };

  this.update = function(nowTime) {
    // Set uniforms: mouse interaction
    var uniforms = this.heightmapVariable.material.uniforms;
    
    // if (this.mouseMoved) {
    //   this.raycaster.setFromCamera(this.mouseCoords, this.camera);
    //   var intersects = this.raycaster.intersectObject(this.meshRay);
    //   if (intersects.length > 0) {
    //     var point = intersects[0].point;
    //     uniforms.mousePos.value.set(point.x, point.z);
    //   } else {
    //     uniforms.mousePos.value.set(10000, 10000);
    //   }
    //   this.mouseMoved = false;
    // } else {
    //   uniforms.mousePos.value.set(10000, 10000);
    // }
    uniforms.mousePos.value.set(100.0 * Math.cos(nowTime * 5.0), 100.0 * Math.sin(nowTime * 5.0));

    // Do the gpu computation
    this.gpuCompute.compute();
    // if (spheresEnabled) {
    //   sphereDynamics();
    // }
    // Get compute output in custom uniform
    this.waterUniforms.heightmap.value =
        this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable).texture;
    // Render

    // this.visualPlane
    this.visualPlane.material.map =
        this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable).texture;
    // console.log(this.waterMesh.geometry.attributes.position.array);
  };
}

export default Scene10;
