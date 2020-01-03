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
		//this.initLights();

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

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {

        // Array for lights' UI
        this.lightSwitches = [];

        // Setup lights with XML values
        this.graph.lights.forEach((value, key) => {
            var light = value;
            var i = light[0];

            this.lights[i].setPosition(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setAmbient(light[4][0], light[4][1], light[4][2], light[4][3]);
            this.lights[i].setDiffuse(light[5][0], light[5][1], light[5][2], light[5][3]);
            this.lights[i].setSpecular(light[6][0], light[6][1], light[6][2], light[6][3]);

            this.lights[i].setConstantAttenuation(light[7]);
            this.lights[i].setLinearAttenuation(light[8]);
            this.lights[i].setQuadraticAttenuation(light[9]);

            if (light[2] == "spot") {
                this.lights[i].setSpotCutOff(light[10]);
                this.lights[i].setSpotExponent(light[11]);
                this.lights[i].setSpotDirection(light[12][0], light[12][1], light[12][2]);
            }

            this.lights[i].setVisible(false);
            if (light[1]) {
                this.lights[i].enable();
                this.lightSwitches.push(true);                
            }
            else {
                this.lights[i].disable();
                this.lightSwitches.push(false);
            }
            
            // Create light UI
            this.interface.addLight(this.lightSwitches, i, key);

            // Update light to reflect changes
            this.lights[i].update();
        });
    }

    onLightSwitched(i) {
        if(this.lightSwitches[i])
            this.lights[i].enable();
        else
            this.lights[i].disable();
        this.lights[i].update();
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
        
        this.initCameras();
        this.initLights();

        // Start animations
        this.graph.startAnimations();
        

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
        this.camera = this.graph.views.get(this.viewIndexToNames[1]);
        this.interface.setActiveCamera(this.camera);
	}

	how_to_play() {
		document.getElementById("rules").style.display = "block";
		document.getElementById("panel").style.display = "none";
	}
}


/*

(Não está por ordem de prioridade)

Ajustar camara de acordo com o tamanho e usar funçao orbit com toggle na interface (Afonso will do)

Coisas do enunciado que ainda nao li (que podem ou nao existir)

*/


/*
Criação da cena de jogo (4.5 valores)
    Tabuleiro                                                       wip
    Aspeto geral                                                    wip
    Jogabilidade, interação, criatividade                           wip
Peças (4.5 valores)
    Modelação                                                       complete
    Movimento e animação por imagens chave.                         todo
Visualização (3 valores)
    Iluminação                                                      wip
    Ambientes de jogo                                               wip
Funcionalidades genéricas do jogo (2.5 valores)
    Nível de dificuldade                                            problem?
    Tipo de jogo                                                    problem?
    Undo                                                            complete
    Rotação da câmara entre pontos de vista pré-definidos           todo
Outras Funcionalidades (1.5 valores)
    Marcador                                                        todo
    Filme do jogo                                                   todo
    Medição do tempo de jogo                                        todo
Software (4 valores)
    Estrutura e parametrização                                      doing ok
    Interligação com Programação em Lógica                          complete
*/