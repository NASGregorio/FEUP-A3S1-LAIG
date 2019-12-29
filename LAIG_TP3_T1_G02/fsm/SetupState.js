class SetupState extends AbstractState {

    constructor(scene, name) {
        super(scene, name);
    };

    enter() {
        super.enter();

        PrologInterpreter.send_request("setup_pvp(GameState)", this.setup_success.bind(this));

    }

    exit() {
        super.exit();
    }

    setup_success(data) {
        this.fsm.switch_state(this.scene.states["UPDATE"], data);
    }
}