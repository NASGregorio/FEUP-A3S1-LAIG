class StateMachine {

    constructor(scene) {
        this.curr_state = null;
    };

    init(state) {
        this.curr_state = state;
        this.curr_state.enter();
    }

    switch_state(new_state, Args) {
        this.curr_state.exit();
        this.curr_state = new_state;
        this.curr_state.enter(Args);
    }
}