class JaleoScene extends CGFscene{

	/**
     * @constructor
     * @param {MyInterface} myinterface
     */
	constructor(myinterface) {
		super();

		this.interface = myinterface;

		this.board = null;

        this.addMove = false;
        this.addCoords = [];
        this.moveMove = false;
        this.moveCoords = [];

        this.info = "";

		this.pickIDs = new Map();
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

		this.board = new MyBoard(this);

		this.fsm = new StateMachine(this);
		this.states = {
			"SETUP": new SetupState(this, "Setup"),
			"UPDATE": new UpdateBoardState(this, "Update"),
			"MOVE": new MoveState(this, "Move")
		};

		this.setPickEnabled(true);
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
						var customId = this.pickResults[i][1];
						let coords = this.pickIDs.get(customId);
                        console.log("Picked object: " + obj + ", in row: " + coords[0] + ", in column: " + coords[1]);
                        this.game_logic(coords);
                    }
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }

    game_logic(coords) {

		let board = this.board.get_board();
		let player = this.board.get_player();

        if(board[coords[0]][coords[1]] == "t") {
            this.addMove = true;
            this.addCoords = coords;
            this.info = "Started add action, choose an empty tile";
        }
        else if((board[coords[0]][coords[1]] == "0") && this.addMove) {
            this.fsm.switch_state(this.states["MOVE"], ['add', [this.addCoords[0],this.addCoords[1]], [coords[0],coords[1]]]);
            this.addMove = false;
        }
        else if(((board[coords[0]][coords[1]][0] == "w" && player == "white") || (board[coords[0]][coords[1]][0] == "b" && player == "black")) && !this.moveMove) {
            this.moveMove = true;
            this.moveCoords = coords;
            this.info = "Started move action";
        }
        else if((board[coords[0]][coords[1]][0] != "0") && this.moveMove) {
            this.fsm.switch_state(this.states["MOVE"], ['move', [this.moveCoords[0],this.moveCoords[1]], [coords[0],coords[1]]]);
            this.moveMove = false;
        }
        else if((board[coords[0]][coords[1]][0] == "w" && player == "black") || (board[coords[0]][coords[1]][0] == "b" && player == "white")) {
            this.inf = "Invalid move, please choose one of your pieces";
            this.addMove = false;
            this.moveMove = false;
        }
        else {
            this.info = "Cleared parameters";
            this.addMove = false;
            this.moveMove = false;
		}
        this.interface.update_info_panel(player,"",this.info,"");
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

		if(this.board != null) {
			this.pushMatrix();
			this.board.display();
			this.popMatrix();
		}
	}

	start_game() {
		this.fsm.init(this.states["SETUP"]);
	}

	how_to_play() {
		console.log("How to play?");
	}
}


/*

(Não está por ordem de prioridade)

limpar nome das funçoes das tiles adjacentes no UpdateBoardState. (usei o do_stuff porque ja lá estava)

Ver situação manhosa da ordem das coordenadas x,y / y,x

Preparar cenas(xml) para a board

Estado de recolha de inputs do jogador:
	Decidir add ou move mediante o tile.
	Nao permitir se peça é do outro jogador (ou deixar fazer o pedido e ao falhar a request, indicar ao player)

Estado antes do input para ver situações de stack (o que o player vê é o mesmo, tem de clicar no pc onde quer fazer stack por exemplo)

Ajustar camera de acordo com o tamanho e usar funçao orbit com toggle na interface

Coisas do enunciado que ainda nao li (que podem ou nao existir)

*/

