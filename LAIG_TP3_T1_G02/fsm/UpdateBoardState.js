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

        PrologInterpreter.request_stack_status(this.scene.board.game_state, this.do_stuff2.bind(this));
    }

    do_stuff2(stack_actions) {
        
        let actions = stack_actions[0];
        let action_count = stack_actions[1];

        if(action_count > 0)
            PrologInterpreter.send_stack_action(actions[0], this.scene.board.game_state, this.do_stuff3.bind(this));
    }

    do_stuff3(game_state) {
        this.update_board(game_state);
    }
}