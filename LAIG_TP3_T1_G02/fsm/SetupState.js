class SetupState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter() {
        super.enter();

        PrologInterpreter.send_setup_pvp(this.setup_success.bind(this));

    }

    exit() {
        super.exit();
    }

    setup_success(data) {
        this.fsm.scene.board.start_time = this.fsm.scene.time;
        this.fsm.scene.interface.update_panel_time(this.fsm.scene.board.start_time);
        this.fsm.scene.board.save_state(data);
        this.fsm.switch_state("UPDATE", data);
    }
}