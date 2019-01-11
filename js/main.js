import { GuiController } from "./GuiController.js";
import { SceneController } from "./SceneController.js";
//////////////////
var sceneController, guiController;


function init() {
	console.clear();
	sceneController = new SceneController();
	sceneController.init();

	
	guiController = new GuiController();
	guiController.init(sceneController);

	
	
	window.addEventListener('resize', onResize, false);
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
	sceneController.resize(w * 2, h * 2);
}
