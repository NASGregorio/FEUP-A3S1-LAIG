class MoveState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(args) {
        super.enter();

        this.fsm.scene.interface.update_panel_info("");

        this.fsm.scene.board.update_last_move(args);

        if(args[0] == "stack")
            PrologInterpreter.send_stack_action(args[1], this.scene.board.game_state, this.action_success.bind(this));
        else
            PrologInterpreter.send_action(args[0], args[1], args[2], this.scene.board.game_state, this.action_success.bind(this));
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