class StartState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter() {
        this.fsm.scene.interface.show_start_options(this);
        this.fsm.scene.interface.clean_panel();
        this.fsm.scene.interface.update_panel_blacks("");
        this.fsm.scene.interface.update_panel_whites("");
        this.fsm.scene.interface.update_panel_tiles("");
        this.fsm.scene.board = new MyBoard(this.fsm.scene);
        this.fsm.scene.board.count = false;
        super.enter();
    }

    exit() {
        super.exit();
    }

    start_game() {
        this.fsm.switch_state("SETUP");
    }

	how_to_play() {
		document.getElementById("rules").style.display = "block";
		document.getElementById("panel").style.display = "none";
    }
}