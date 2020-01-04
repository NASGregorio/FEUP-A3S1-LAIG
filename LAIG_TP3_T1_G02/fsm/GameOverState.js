class GameOverState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(winner) {
        super.enter();
        console.log(winner);
        this.fsm.scene.game_over();

        this.game_film = this.fsm.scene.board.invert_film_game();
        for (let i = 0; i < this.game_film.length; i++) {
            this.fsm.scene.board.replay(this.game_film[i]);
        }

        this.fsm.scene.interface.update_panel_game_over(`Player ${winner} wins in ${this.fsm.scene.board.counter} seconds! Congratulations.`);

        this.fsm.scene.board.count = false;

        this.fsm.scene.interface.show_game_over_menu();
    }

    exit() {
        super.exit();
    }

    reset_game() {
        this.fsm.init("SETUP");
    }
}