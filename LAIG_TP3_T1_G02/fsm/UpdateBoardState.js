class UpdateBoardState extends AbstractState {

    constructor(scene, name) {
        super(scene, name);

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

        PrologInterpreter.request_empty_adj(data[0], this.scene.board.get_all_occupied_tiles(), this.do_stuff.bind(this));
    }
    
    do_stuff(adj_tiles) {
        
        this.scene.board.update_adj(adj_tiles);

        PrologInterpreter.request_stack_status(this.scene.board.game_state);
    }
}