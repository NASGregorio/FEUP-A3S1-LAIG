class LightingScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

		this.interface = myinterface;

		this.texture = null;
		this.appearance = null;
		this.response = null;
		this.board = null;
	}

	init(application) {
		super.init(application);
		
		this.initCameras();
		this.initLights();
		this.gl.clearColor(0, 0, 0, 1.0);
		this.gl.clearDepth(10000.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.axis = new CGFaxis(this);

		this.appearance = new CGFappearance(this);
		this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
		this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
		this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
		this.appearance.setShininess(120);
		this.setPickEnabled(true);

		this.states = {
			"START": new UpdateBoardState(this, "Start")
		};

		this.fsm = new StateMachine(this);
	}

	initLights() {
		this.lights[0].setPosition(4, 3, 4, 1);
		this.lights[0].setAmbient(0.1, 0.1, 0.1, 1);
		this.lights[0].setDiffuse(0.8, 0.8, 0.8, 1);
		this.lights[0].setSpecular(0, 0, 0, 1);
		this.lights[0].enable();
		this.lights[0].update();
		
		this.lights[1].setPosition(3,3,3,1);
		this.lights[1].setAmbient(0.1, 0.1, 0.1, 1);
		this.lights[1].setDiffuse(0.9, 0.9, 0.9, 1);
		this.lights[1].setSpecular(0, 0, 0, 1);
		this.lights[1].enable();
		this.lights[1].update();
	}

	initCameras() {
		this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 14, 13), vec3.fromValues(0, 0, 0));
	}

	logPicking() {
		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i = 0; i < this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj) {
						var customId = this.pickResults[i][1] - 1;
						var col = customId % 10;
						var row = Math.floor(customId / 10);
						console.log("Picked object: " + obj + ", in row: " + row + ", in column: " + col);
						var move =  '[add,[' + row + ',' + col + '],[' + 2 + ',' + 0 + ']]';
						var extract_move =  "extract_move(" + move + ",Action,Arg1,Arg2)";
						//console.log(extract_move);
						// this.makeRequest(extract_move);
						console.log(move);
						console.log(this.GameState);
						var moveString = 'move(' + move + ',' + this.GameState + ',NewBoard)';
						moveString = moveString.replace(/"| /g, '');
						console.log(moveString);
						this.makeRequest(moveString);
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}
		}
	}

	display() {

		this.logPicking();
		this.clearPickRegistration();
		// Clear image and depth buffer every time we update the scene
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.enable(this.gl.DEPTH_TEST);

		// Initialize Model-View matrix as identity (no transformation
		this.updateProjectionMatrix();
		this.loadIdentity();

		// Apply transformations corresponding to the camera position relative to the origin
		this.applyViewMatrix();
		
		// Update all lights used
		this.lights[0].update();

		// Draw axis
		this.axis.display();
		this.appearance.apply();

		// if(this.board != null) {
		// 	this.pushMatrix();
		// 	this.board.display();
		// 	this.popMatrix();
		// }
		// else {
		// 	this.makeRequest("setup_pvp(GameState)");
		// 	if(this.response != null) {
		// 		this.parseBoard(this.response);
		// 	}
		// }
	}

	parseBoard(boardString) {
		console.log(boardString);

		var asd = JSON.parse(boardString);
		console.log(asd);
		this.board = new MyBoard(this);
		// for (let index = 0; index < boardString.length; index++) {
		//     array[index];
			
		// }
		this.board.update_array(asd[0]);

		this.GameState = boardString;
	}

	start_game() {
		this.fsm.init(this.states["START"]);
	}

	how_to_play() {
		console.log("How to play?");
	}
}
