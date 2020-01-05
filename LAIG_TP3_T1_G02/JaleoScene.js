class JaleoScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

        this.interface = myinterface;

        this.moving_camera = false;
        this.camera_side1 = vec4.fromValues(-30, 15, 0, 0);
        this.camera_side2 = vec4.fromValues(30, 15, 0, 0);
        this.camera_target = this.camera_side1;
        this.camera_rot_duration = 2;

        this.game_mode = "PvsP";
	}
    
	init(application) {
        
        super.init(application);
        
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

        this.setUpdatePeriod(1000/120);
        this.lastUpdate = Date.now();

        this.interface.addScenes();
        this.onSceneChanged();

        this.fsm = new StateMachine(this);
        this.fsm.init("START");

        // Start animations
        //this.graph.startAnimations();
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
        this.camera = this.graph.views.get(this.selectedView);
        this.interface.setActiveCamera(this.camera);
    }

    onSceneChanged() {

        this.sceneInited = false;

        this.graph = this.graphs.get(this.selectedScene);
        this.graph.load();

        this.sceneInited = true;
    }
    //////////////////////


    move_camera() {

        let player = this.board.get_player();
        this.camera_lerp_elapsed = 0;
        
        if(player == "black") {
            this.camera_target = this.camera_side2;
            this.camera.setPosition(this.camera_side1);
            this.moving_camera = true;
        }
        else if(player == "white") {
            this.camera_target = this.camera_side1;
            this.camera.setPosition(this.camera_side2);
            this.moving_camera = true;
        }
        this.camera.setTarget(vec3.fromValues(0,0,0));

    }

    lerp_camera(target, t) {

        this.camera._up = vec3.fromValues(0, 1, 0);
        this.camera.orbit("x", Math.PI / 100);

        if(vec3.distance(this.camera.position, target) < 0.1 || t >= 1) {
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

Ajustar camara de acordo com o tamanho e usar funçao orbit com toggle na interface (Afonso will do)

Coisas do enunciado que ainda nao li (que podem ou nao existir)

Usar exit da InputState ( e das outras)

TODO Afonso: Game Film - animation

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