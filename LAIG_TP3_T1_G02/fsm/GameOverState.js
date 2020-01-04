class GameOverState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(winner,time) {
        super.enter();
        console.log(winner);
        this.fsm.scene.game_over();
        this.fsm.scene.interface.update_panel_game_over(`Player ${winner} wins in ${time} seconds! Congratulations.`);
        this.fsm.scene.board.count = false;

        this.fsm.scene.interface.show_game_over_menu();
    }

    exit() {
        super.exit();
    }

    reset_game() {
        this.fsm.init("SETUP");
    }

    go_to_start() {
        
    }
}