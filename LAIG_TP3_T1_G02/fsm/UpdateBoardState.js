class UpdateBoardState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);

    };

    enter(data) {
        super.enter();
        
        this.scene.interface.show_turn_information(this);

        this.update_board(data);
    }

    exit() {
        super.exit();
    }

    update_board(data) {

        this.scene.board.update_board(data);

        PrologInterpreter.request_empty_adj(data[0], this.scene.board.get_all_occupied_tiles(), this.empty_adj_success.bind(this));
    }
    
    empty_adj_success(adj_tiles) {
        
        this.scene.board.update_adj(adj_tiles);

        PrologInterpreter.request_stack_status(this.scene.board.game_state, this.stack_status_success.bind(this));
    }

    stack_status_success(stack_actions) {
        
        this.fsm.switch_state("INPUT", stack_actions);
    }

    do_stuff() {
        console.log("Do Stuff!");
    }
}