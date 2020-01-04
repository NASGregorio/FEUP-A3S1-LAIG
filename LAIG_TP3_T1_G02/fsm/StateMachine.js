class StateMachine {

    constructor(scene) {

        this.scene = scene;

        this.curr_state = null;
        this.curr_state_key = null;

        this.states = {
			"START": new StartState(this, "Start"),
			"SETUP": new SetupState(this, "Setup"),
			"UPDATE": new UpdateBoardState(this, "Update"),
			"INPUT": new InputState(this, "Input"),
			"BOT": new InputState(this, "Bot"),
            "MOVE": new MoveState(this, "Move"),
            "GAMEOVER": new GameOverState(this, "Game Over"),
		};
    };

    init(initial_state) {
        this.curr_state_key = initial_state;
        this.curr_state = this.states[initial_state];
        this.curr_state.enter();
    }

    switch_state(new_state, Args) {
        this.curr_state_key = new_state;
        this.curr_state.exit();
        this.curr_state = this.states[new_state];
        this.curr_state.enter(Args);
    }
}