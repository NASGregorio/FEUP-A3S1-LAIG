class MoveState extends AbstractState {

    constructor(scene, name) {
        super(scene, name);
    };

    enter(Args) {
        super.enter();

        PrologInterpreter.send_action(Args[0], Args[1], Args[2], this.scene.game_state, this.action_success.bind(this));

    }

    exit() {
        super.exit();
    }

    action_success(data) {

        if(data !== 'Bad Request')
            this.fsm.switch_state(this.scene.states["UPDATE"], data);
    }
}