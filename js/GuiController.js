import * as THREE from './libs_es6/three.module.js';
import Stats from './libs_es6/Stats.js';
import * as dat from './libs_es6/dat.gui.module.js';
///////////////
//////////////
var GuiController = function() {
  this.init = function(sceneController) {
    
    this.initStats();
    this.initGui(sceneController);
  };

  this.initGui = function(sceneController) {
    var params = {
      exposure: 1,
      bloomThreshold: 0,
      bloomStrength: 3,
      bloomRadius: 0.1,
      alphaThreshold: 0.1,
      debugscale: 0.1,
      RayboScene: 10,
    };
    this.gui = new dat.GUI();

    this.gui
        .add(params, 'RayboScene', {
          '1 基础场景': 1,
          '2 二维定点箭头': 2,
          '3 二维运动箭头': 3,
          '4 三维定点箭头': 4,
          '5 三维定点矩形': 5,
          '6 三维定点矩形_2': 6,
          '7 三维运动箭头': 7,
          '8 Raymarching': 8,
          '9 Raymarching_2': 9,
          '10 gpgpu water': 10,
          '11 gpgpu test': 11,
        })
        .onChange(function(value) {
          // console.log(value);

          sceneController.sceneInit(value);
        });
    // this.gui.add(params, 'bloomThreshold',
    // 0.0, 1.0).onChange(function(value) {
    // sceneController.bloomPass.threshold = Number(value);
    // });
    // this.gui.add(params, 'bloomStrength',
    // 0.0, 3.0).onChange(function(value) {
    // sceneController.bloomPass.strength = Number(value);
    // });
    // this.gui
    // 	.add(params, 'bloomRadius', 0.0, 1.0)
    // 	.step(0.01)
    // 	.onChange(function(value) {
    // 		sceneController.bloomPass.radius = Number(value);
    // 	});
  };

  this.initStats = function() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  };
  this.update = function() {
    this.stats.begin();
    this.stats.end();
  };
};

export {GuiController};