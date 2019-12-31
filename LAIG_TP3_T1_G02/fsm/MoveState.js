class MoveState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(Args) {
        super.enter();

        //console.log(Args);

        this.fsm.scene.interface.update_panel_info(this.fsm.scene.info);

        PrologInterpreter.send_action(Args[0], Args[1], Args[2], this.scene.board.game_state, this.action_success.bind(this));

    }

    exit() {
        super.exit();
    }

    action_success(data) {

        if(data !== 'Bad Request')
            this.fsm.switch_state("UPDATE", data);
    }
}