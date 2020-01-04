class JaleoScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

        this.interface = myinterface;
	}
    
	init(application) {
        
        super.init(application);
        
		this.board = new MyBoard(this);
		this.fsm = new StateMachine(this);
        
        this.pickIDs = new Map();
        this.setPickEnabled(true);

        this.enableTextures(true);
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.initModels();
        this.initMaterials();


        this.initScenes();
    }

    initScenes() {

        this.xml_load_requests = 0;
        this.graph = null;
        this.graphs = new Map();
        this.graphNames = [];

        this.initScene("demo.xml", "demo");
        this.initScene("alternative_scene.xml", "casino");

        this.selectedScene = "casino";
    }

    initScene(filename, sceneName) {
        let scene = new MySceneGraph(filename, this);
        this.xml_load_requests++;
        this.graphs.set(sceneName, scene);
        this.graphNames.push(sceneName);
    }

    initMaterials() {
        this.greyMat = new CGFappearance(this);
		this.greyMat.setAmbient(0.0, 0.0, 0.0, 1);
		this.greyMat.setDiffuse(0.2, 0.2, 0.2, 1);
		this.greyMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.greyMat.setShininess(120);
    }

    initModels() {
        this.axis = new CGFaxis(this, 1);
        this.slotMachine = new CGFOBJModel(this, 'models/slot_machine.obj');
    }

    onGraphLoaded() {
        
        this.xml_load_requests--;
        
        if(this.xml_load_requests != 0)
            return;

        this.interface.addScenes();
        
        this.setUpdatePeriod(1000/120);
        this.lastUpdate = Date.now();
            
        this.onSceneChanged();

        // Start animations
        this.graph.startAnimations();
    }



    // Interface callbacks
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

    onSceneChanged() {

        this.sceneInited = false;

        this.graph = this.graphs.get(this.selectedScene);
        this.graph.load();

        this.sceneInited = true;
    }
    //////////////////////


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

    update(tNow) {
        var dt = tNow - this.lastUpdate;
        this.graph.update(dt);                
        this.time = tNow;
        if(this.board.count == true) {
            this.board.counter = Math.round((this.time - this.board.start_time)/1000);
            this.interface.update_panel_time(Math.round(this.board.counter));
        }
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
        
        // Slot Machines display
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
	}

	start_game() {
        this.fsm.init("SETUP");
        // this.camera = this.graph.views.get(this.viewIndexToNames[1]);
        // this.interface.setActiveCamera(this.camera);
	}

	how_to_play() {
		document.getElementById("rules").style.display = "block";
		document.getElementById("panel").style.display = "none";
    }
    
    game_over() {
		document.getElementById("game_over").style.display = "block";
		document.getElementById("panel").style.display = "none";
    }
}


/*

(Não está por ordem de prioridade)

Ajustar camara de acordo com o tamanho e usar funçao orbit com toggle na interface (Afonso will do)

Coisas do enunciado que ainda nao li (que podem ou nao existir)

Usar exit da InputState ( e das outras)

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
    Medição do tempo de jogo                                        done
Software (4 valores)
    Estrutura e parametrização                                      doing ok
    Interligação com Programação em Lógica                          complete
*/