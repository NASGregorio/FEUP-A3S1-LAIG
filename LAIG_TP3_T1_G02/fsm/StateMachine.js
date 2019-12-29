class StateMachine {

    constructor(scene) {
        this.curr_state = null;
    };

    init(state) {
        this.curr_state = state;
        this.curr_state.init();
    }
}