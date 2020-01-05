class SetupState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter() {
        PrologInterpreter.send_setup_pvp(this.setup_success.bind(this));
        
        this.fsm.bot_turn = false;
        
        if(this.fsm.scene.game_mode == "BvsB") {
            this.fsm.scene.interface.show_go_to_start(this);
        }
        super.enter();
    }

    exit() {
        super.exit();
    }

    setup_success(data) {
        this.fsm.scene.board.start_time = this.fsm.scene.time;
        this.fsm.scene.board.count = true;
        this.fsm.scene.interface.update_panel_time(this.fsm.scene.board.start_time);
        this.fsm.scene.board.save_state(data);

        this.fsm.scene.board.set_origin(data);

        this.fsm.switch_state("UPDATE", data);
    }

    go_to_start() {
        this.fsm.switch_state("START");
    }
}