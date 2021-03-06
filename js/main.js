import { GuiController } from "./GuiController.js";
import { SceneController } from "./SceneController.js";
//////////////////
var sceneController, guiController;

function init() {
  var initSceneIndex = 17;
  // console.clear();
  console.log(
    "%cMade with three.js by Raybo",
    "color: #ffffff; font-size: 20px; padding: 20px 20px 30px 20px; font-fmaily: sans-serif; text-shadow: 1px 1px #7FF7AD, 2px 2px #357FE7, 3px 3px #542EE9, 4px 4px #D32DAF"
  );
  sceneController = new SceneController();
  
  guiController = new GuiController();
  sceneController.init(initSceneIndex);
  guiController.init(sceneController, initSceneIndex);
  // scene init gui
  sceneController.guiController = guiController;
  sceneController.sceneInit(initSceneIndex);

  window.addEventListener("resize", onResize, false);
}



function render() {
  requestAnimationFrame(render);

  if (guiController) {
    guiController.update();
  }
  // stats.update();
  sceneController.render();
}

init();
render();

function onResize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  sceneController.resize(w, h);
}
