class JaleoScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

		this.interface = myinterface;

		this.board = null;

        this.info = "";

        this.pickIDs = new Map();

	}

	init(application) {

		super.init(application);

		//this.initCameras();
		this.initLights();

		this.gl.clearColor(0, 0, 0, 1.0);
		this.gl.clearDepth(10000.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);


		this.board = new MyBoard(this);

		this.fsm = new StateMachine(this);

        this.setPickEnabled(true);
        
        this.timeFactor = 1;

        this.slotMachine = new CGFOBJModel(this, 'models/slot_machine.obj');
        this.tv = new CGFOBJModel(this, 'models/tv.obj');

        this.greyMat = new CGFappearance(this);
		this.greyMat.setAmbient(0.2, 0.2, 0.2, 1);
		this.greyMat.setDiffuse(0.2, 0.2, 0.2, 1);
		this.greyMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.greyMat.setShininess(120);

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

    onViewChanged() {
        this.camera = this.graph.views.get(this.viewIndexToNames[this.selectedView]);
        this.interface.setActiveCamera(this.camera);
    }

	initCameras() {
        this.selectedView = 0;
        this.viewNamesToIndex = {};
        this.viewIndexToNames = {};
        
        var i = 0;
        this.graph.views.forEach((value, key) => {
            this.viewNamesToIndex[key] = i;
            this.viewIndexToNames[i] = key;
            i++;
        });
        
        // Set camera to XML's default
        this.selectedView = this.viewNamesToIndex[this.graph.defaultView];
        this.onViewChanged();


        // Create camera UI
        this.interface.addViews();
    }


	logPicking() {

		if(this.fsm.curr_state_key != "INPUT")
			return;

		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i = 0; i < this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj) {
						var customId = this.pickResults[i][1];
						let coords = this.pickIDs.get(customId);
                        console.log("Picked object: " + obj + ", in row: " + coords[0] + ", in column: " + coords[1]);
                        this.fsm.curr_state.update_coord_selection(coords);
                    }
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }

    onGraphLoaded() {
		
		this.enableTextures(true);
		
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
		
        this.setUpdatePeriod(1000/120);
		
        this.lastUpdate = Date.now();
		
        this.axis = new CGFaxis(this, this.graph.referenceLength);
		
        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
		
        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);
		
        this.sceneInited = true;
        
        // Start animations
        this.graph.startAnimations();
		this.initCameras();

    }

    update(tNow) {
        var dt = tNow - this.lastUpdate;
        this.graph.update(dt);
        this.time = tNow;
        //this.camera.orbit("x",Math.PI/200);
    }

	display() {
        if (!this.sceneInited)
            return;

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
		// this.axis.display();

        this.pushMatrix();
        this.graph.displayScene();
        this.popMatrix();
        
		if(this.board != null) {
            this.pushMatrix();
            this.translate(0,4,0);
			this.board.display();
			this.popMatrix();
        }
        
        this.pushMatrix();
            this.greyMat.apply();
            this.translate(0,-3,-35);
            this.scale(0.2,0.2,0.2);
            this.rotate(-Math.PI/2,1,0,0);
            this.slotMachine.display();
            this.translate(150,0,0);
            this.slotMachine.display();
            this.translate(-300,0,0);
            this.slotMachine.display();
        this.popMatrix();

        this.pushMatrix();
            this.greyMat.apply();
            this.translate(-57,1,0);
            this.rotate(Math.PI/2,0,1,0);
            this.scale(10,10,5);
            this.tv.display();
        this.popMatrix();

        this.pushMatrix();
            this.greyMat.apply();
            this.translate(57,1,0);
            this.rotate(-Math.PI/2,0,1,0);
            this.scale(10,10,5);
            this.tv.display();
        this.popMatrix();

	}

	start_game() {
		this.fsm.init("SETUP");
	}

	how_to_play() {
		document.getElementById("rules").style.display = "block";
		document.getElementById("panel").style.display = "none";
	}
}


/*

(Não está por ordem de prioridade)

Preparar cenas(xml) para a board

Ajustar camara de acordo com o tamanho e usar funçao orbit com toggle na interface

Arranjar menus/interface

Coisas do enunciado que ainda nao li (que podem ou nao existir)

*/

