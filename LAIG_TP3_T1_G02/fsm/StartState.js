class StartState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter() {
        super.enter();
        this.fsm.scene.interface.show_start_options(this);
        this.fsm.scene.board = new MyBoard(this.fsm.scene);
    }

    exit() {
        super.exit();
    }

    start_game() {
        this.fsm.init("SETUP");
    }

	how_to_play() {
		document.getElementById("rules").style.display = "block";
		document.getElementById("panel").style.display = "none";
    }
}