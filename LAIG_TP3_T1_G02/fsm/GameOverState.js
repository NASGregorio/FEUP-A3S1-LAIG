class GameOverState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(winner) {
        console.log(winner);
        this.fsm.scene.interface.show_game_over();

        this.fsm.scene.board.count = false;
        this.fsm.scene.interface.update_panel_game_over(`Player ${winner} wins in ${this.fsm.scene.board.counter} seconds! Congratulations.`);


        this.fsm.scene.interface.show_game_over_menu(this);

        super.enter();
    }

    exit() {
        super.exit();
        this.fsm.scene.interface.hide_game_over();
    }

    go_to_start() {
        this.fsm.switch_state("START");
    }
    
    show_game_film() {

        this.fsm.scene.interface.update_panel_blacks("");
        this.fsm.scene.interface.update_panel_whites("");
        this.fsm.scene.interface.update_panel_tiles("");

        this.fsm.scene.board.adj_tiles = [];

        (async function loop(board) {
        for (let i = 0; i < board.saved_game_states.length; i++) {
            console.log("I AM IRON MAN!");
            await new Promise(resolve => setTimeout(resolve, 1000));
            board.game_state = board.saved_game_states[i];
        }
        })(this.fsm.scene.board);
    }

    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}