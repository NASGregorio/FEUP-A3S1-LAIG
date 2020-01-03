class GameOverState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(winner) {
        super.enter();
        console.log(winner);

        this.fsm.scene.interface.show_game_over_menu();

        this.fsm.scene.interface.update_panel_info(`Player ´${winner}' wins! Congratulations.`);
        this.fsm.scene.interface.update_panel_player("");
        this.fsm.scene.board.end_time = this.fsm.scene.time;
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