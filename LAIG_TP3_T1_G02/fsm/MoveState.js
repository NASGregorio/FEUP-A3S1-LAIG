class MoveState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(Args) {
        super.enter();

        this.fsm.scene.interface.update_panel_info("");

        if(Args[0] == "stack")
            PrologInterpreter.send_stack_action(Args[1], this.scene.board.game_state, this.action_success.bind(this));
        else
            PrologInterpreter.send_action(Args[0], Args[1], Args[2], this.scene.board.game_state, this.action_success.bind(this));

    }

    exit() {
        super.exit();
    }

    action_success(data) {

        if(data !== 'Bad Request')
            this.fsm.switch_state("UPDATE", data);
        else
            this.fsm.switch_state("INPUT", []);
    }
}