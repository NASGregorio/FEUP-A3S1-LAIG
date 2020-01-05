class InputState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);

        this.current_selection = null;
        this.previous_selection = null;

        this.add_action = false;
        this.move_action = false;
        this.stack_action = false;
    };

    enter(stack_actions) {

        this.scene.interface.show_panel();

        
        this.stack_actions = stack_actions;

        if(stack_actions != null && stack_actions.length > 0) {
            this.fsm.scene.interface.update_panel_info("STACK situation detected | Pick piece to move.");
            this.fsm.scene.interface.update_panel_blacks(this.fsm.scene.board.available_blacks);
            this.fsm.scene.interface.update_panel_whites(this.fsm.scene.board.available_whites);
            this.fsm.scene.interface.update_panel_tiles(this.fsm.scene.board.available_tiles);
            this.stack_action = true;
        }
        else {
            this.fsm.scene.interface.update_panel_info("ADD or MOVE available | Pick an hexagon or piece.");
            this.fsm.scene.interface.update_panel_blacks(this.fsm.scene.board.available_blacks);
            this.fsm.scene.interface.update_panel_whites(this.fsm.scene.board.available_whites);
            this.fsm.scene.interface.update_panel_tiles(this.fsm.scene.board.available_tiles);
        }

        switch (this.fsm.scene.game_mode) {
            case "PvsP":
                this.scene.interface.show_turn_information(this);
                break;
            case "PvsB":
                if(this.fsm.bot_turn) {
                    this.fsm.scene.setPickEnabled(false);
                    this.sleep(1000).then(() => { this.bot_logic(); });
                }
                else {
                    this.scene.interface.show_turn_information(this);
                }
                break;
            case "BvsB":
                    this.fsm.scene.setPickEnabled(false);
                    this.sleep(0).then(() => { this.bot_logic(); });
                break;
            default:
                break;
        }

        super.enter();
    }

    exit() {
        super.exit();
        this.clear_parameters();
        this.fsm.scene.interface.clean_folder();
    }

    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    bot_logic() {
        if(this.stack_action) {
            let idx = this.randomIntFromInterval(0, this.stack_actions.length-1);
            this.fsm.switch_state("MOVE", ['stack', this.stack_actions[idx]]);
        }
        else {
            let blacks = this.fsm.scene.board.game_state[5];
            let whites = this.fsm.scene.board.game_state[6];
            let chance = this.randomIntFromInterval(0, 100);
            if(chance <= 49) {
                // ADD
                let tiles = this.fsm.scene.board.game_state[4];
                let tile_id = this.randomIntFromInterval(0, tiles.length-1);

                let adj_tiles = this.fsm.scene.board.adj_tiles;
                let adj_id = this.randomIntFromInterval(0, adj_tiles.length-1);

                this.fsm.switch_state("MOVE", ['add', tiles[tile_id].reverse(), adj_tiles[adj_id].reverse()]);  
            }
            else {
                // TODO: MOVE
                let tiles = this.fsm.scene.board.game_state[4];
                let tile_id = this.randomIntFromInterval(0, tiles.length-1);

                let adj_tiles = this.fsm.scene.board.adj_tiles;
                let adj_id = this.randomIntFromInterval(0, adj_tiles.length-1);

                this.fsm.switch_state("MOVE", ['add', tiles[tile_id].reverse(), adj_tiles[adj_id].reverse()]);  
            }
        }
    }

    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    update_coord_selection(coords) {

        if(!this.current_selection) {
            this.previous_selection = null;
            this.current_selection = coords;
            this.game_logic();
        }
        else if (JSON.stringify(this.current_selection) != JSON.stringify(coords)){
            this.previous_selection = this.current_selection;
            this.current_selection = coords;
            this.game_logic();
        }
    }

    game_logic() {

        let board = this.fsm.scene.board;
        let current_symbol = board.get_cell_at(this.current_selection)[0];
        let player = board.get_player();
        let player_symbol = (player == "white") ? "w" : "b";

        if(this.stack_action) {
            return this.handle_stack_logic(current_symbol, player_symbol);
        }

        if(this.previous_selection == null) {
            return this.detect_type_of_action(current_symbol, player_symbol);
        }

        if(this.add_action) {
            return this.handle_add_logic(current_symbol);
        }

        if(this.move_action) {
            return this.handle_move_logic(current_symbol);
        }
    }

    handle_stack_logic(current_symbol, player_symbol) {
        let coords_str = JSON.stringify(this.current_selection);

        if(current_symbol != player_symbol) {
            this.matching_stack = null;
            this.fsm.scene.interface.update_panel_info("STACK situation detected | Pick piece to move.");
            return;
        }

        if(this.matching_stack != null) {
            let destination = JSON.stringify( this.matching_stack[1] );
            if(coords_str == destination) {
                this.fsm.switch_state("MOVE", ['stack', this.matching_stack]);
            }
        }
        else {
            for (let i = 0; i < this.stack_actions.length; i++) {
                let action = this.stack_actions[i];
                let origin = JSON.stringify( action[0] );
                if(coords_str == origin) {
                    this.matching_stack = action;
                    this.fsm.scene.interface.update_panel_info("STACK action | Pick adjacent piece.");
                }
            }
        }
        return;
    }

    detect_type_of_action(current_symbol, player_symbol) {
        if(current_symbol == "t") {
            this.add_action = true;
            this.fsm.scene.interface.update_panel_info("ADD action | Pick white hexagon.");
        }
        else if(current_symbol != "0") {
            if(current_symbol == player_symbol) {
                this.move_action = true;
                this.fsm.scene.interface.update_panel_info("MOVE action | Pick single adjacent piece");
            }
            else {
                this.fsm.scene.interface.update_panel_info("Can't move opponent's piece.");
                this.current_selection = null;
            }
        }
        else {
            this.fsm.scene.interface.update_panel_info("");
            this.current_selection = null;
        }
    }

    handle_add_logic(current_symbol) {
        if(current_symbol == "0") {
            this.fsm.switch_state("MOVE", ['add', this.previous_selection, this.current_selection]);            
        }
        else {
            this.fsm.scene.interface.update_panel_info("Invalid add action.");
        }
        this.add_action = false;
        this.previous_selection = null;
        this.current_selection = null;
    }

    handle_move_logic(current_symbol) {
        if(current_symbol != "0" && current_symbol != "t") {
            this.fsm.switch_state("MOVE", ['move', this.previous_selection, this.current_selection]);
        }
        else {
            this.fsm.scene.interface.update_panel_info("Invalid move action.");
        }
        this.move_action = false;
        this.previous_selection = null;
        this.current_selection = null;
    }

    clear_parameters() {
        this.current_selection = null;
        this.previous_selection = null;

        this.add_action = false;
        this.move_action = false;
        this.stack_action = false;

        this.stack_actions = null;
        this.matching_stack = null;
        this.fsm.scene.interface.update_panel_info("");
    }

    clear_turn() {
        this.previous_selection = null;
        this.current_selection = null;
        this.matching_stack = null;
        this.stack_action = false;
        this.add_action = false;
        this.move_action = false;

        if(this.stack_actions != null && this.stack_actions.length > 0) {
            this.fsm.scene.interface.update_panel_info("STACK situation detected | Pick piece to move.");
            this.stack_action = true;
        }
        else {
            this.fsm.scene.interface.update_panel_info("ADD or MOVE available | Pick an hexagon or piece.");
        }
    }

    undo_turn() {
        if(this.fsm.scene.board.saved_game_states.length < 2) {
            return;
        }

        if(!this.fsm.bot_turn) {
            let board = this.fsm.scene.board.undo();
            this.fsm.switch_state("UPDATE", board);
        }
    }

    redo_turn() {
        if(this.fsm.scene.board.redo_stack.length > 0) {
            if(!this.fsm.bot_turn)
                this.fsm.scene.board.redo();
            let board = this.fsm.scene.board.redo();
            this.fsm.switch_state("UPDATE", board);
        }
    }

    go_to_start() {
        this.fsm.switch_state("START");
	}
}