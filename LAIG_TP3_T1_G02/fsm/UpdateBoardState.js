class UpdateBoardState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);
    };

    enter(data) {
        
        this.update_board(data);
        super.enter();
    }

    exit() {
        super.exit();
    }

    update_board(data) {

        this.scene.interface.update_panel_player(data[3]);

        this.scene.board.update_board(data);

        PrologInterpreter.request_gameover_status(this.scene.board.game_state, this.fsm.scene.board.last_move, this.gameover_status_success.bind(this));
    }

    gameover_status_success(winner) {
        if(winner == "Bad Request") {
            PrologInterpreter.request_empty_adj(this.scene.board.get_board(), this.scene.board.get_all_occupied_tiles(), this.empty_adj_success.bind(this));
        }
        else {
            this.fsm.switch_state("GAMEOVER", winner);
        }
    }
    
    empty_adj_success(adj_tiles) {
        
        this.scene.board.update_adj(adj_tiles);

        PrologInterpreter.request_stack_status(this.scene.board.game_state, this.stack_status_success.bind(this));
    }

    stack_status_success(stack_actions) {
        
        this.fsm.switch_state("INPUT", stack_actions);
    }
}