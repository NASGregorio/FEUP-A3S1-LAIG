class JaleoScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

        this.interface = myinterface;


        this.rotate_camera = false;
        this.moving_camera = false;
        this.game_mode = "PvsP";
	}
    
	init(application) {
        
        super.init(application);

        
        this.camera = new CGFcamera(0.4, 10, 1000, vec3.fromValues(45, 45, 45), vec3.fromValues(0, 0, 0));
        
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

        this.initScene("casino_main.xml", "casino");
        this.initScene("casino_night.xml", "casino_night");
        this.initScene("game_table.xml", "game_table");

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

        this.setUpdatePeriod(1000/120);
        this.lastUpdate = Date.now();


        this.interface.addScenes();
        this.onSceneChanged();

        this.fsm = new StateMachine(this);
        this.fsm.init("START");
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
        let cameraData = this.graph.views.get(this.selectedView);

        this.loadValues(cameraData);
        this.interface.setActiveCamera(this.camera);
    }

    onSceneChanged() {

        this.sceneInited = false;

        this.graph = this.graphs.get(this.selectedScene);
        this.graph.load();

        this.sceneInited = true;
    }
    //////////////////////

    loadValues(cameraData) {
        this.camera.fov = cameraData.fov;
        this.camera.near = cameraData.nearPlane;
        this.camera.far = cameraData.farPlane;
        this.camera._up = vec3.fromValues(0, 1, 0);

        this.camera.setPosition(cameraData.position);
        this.camera.setTarget(cameraData.target);
    }

    move_camera() {

        if(!this.rotate_camera)
            return;

        let player = this.board.get_player();
        this.camera_lerp_elapsed = 0;
        this.camera_rot_duration = 2;
        
        if(player == "black") {
            this.camera_target = this.graph.views.get("Player2").position;
            this.camera.setPosition(this.graph.views.get("Player1").position);
            this.moving_camera = true;
        }
        else if(player == "white") {
            this.camera_target = this.graph.views.get("Player1").position;
            this.camera.setPosition(this.graph.views.get("Player2").position);
            this.moving_camera = true;
        }
        this.camera.setTarget(vec3.fromValues(0,0,0));

    }

    lerp_camera(target, t) {

        this.camera._up = vec3.fromValues(0, 1, 0);
        this.camera.orbit("x", Math.PI / 100);

        let a = vec2.fromValues(this.camera.position[0], this.camera.position[2]);
        let b = vec2.fromValues(target[0], target[2]);

        if(vec2.distance(a, b) < 0.1 || t >= 1) {
            this.moving_camera = false;
            this.camera.setPosition(target);
            this.camera.setTarget(vec3.fromValues(0,0,0));
        }
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

    update(tNow) {
        this.time = tNow;
        var dt = tNow - this.lastUpdate;
        this.camera_lerp_elapsed += (dt/1000)
        
        if(this.moving_camera) {
            this.lerp_camera(this.camera_target, (this.camera_lerp_elapsed / this.camera_rot_duration) );
        }

        this.graph.update(dt);    
        this.fsm.update(dt);
        this.board.update(this.time);
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
		//this.axis.display();

        this.pushMatrix();
        this.graph.displayScene();
        this.popMatrix();
        
		if(this.board != null) {
            this.pushMatrix();
            this.translate(0,4,0);
			this.board.display();
			this.popMatrix();
        }

        if(this.fsm != null) {
            this.pushMatrix();
            this.fsm.display();
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
}


/*

(Não está por ordem de prioridade)

BIG TODO : bot move logic
Small bug on game over to start menu


*/


/*
Criação da cena de jogo (4.5 valores)
    Tabuleiro                                                       complete
    Aspeto geral                                                    complete
    Jogabilidade, interação, criatividade                           complete
Peças (4.5 valores)
    Modelação                                                       complete
    Movimento e animação por imagens chave.                         complete
Visualização (3 valores)
    Iluminação                                                      complete
    Ambientes de jogo                                               complete
Funcionalidades genéricas do jogo (2.5 valores)
    Nível de dificuldade                                            complete
    Tipo de jogo                                                    complete
    Undo                                                            complete
    Rotação da câmara entre pontos de vista pré-definidos           complete
Outras Funcionalidades (1.5 valores)
    Marcador                                                        complete
    Filme do jogo                                                   complete
    Medição do tempo de jogo                                        complete
Software (4 valores)
    Estrutura e parametrização                                      complete
    Interligação com Programação em Lógica                          complete
*/