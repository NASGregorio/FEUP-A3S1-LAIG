class InputState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);

        this.current_selection = null;
        this.previous_selection = null;

        this.add_action = false;
        this.move_action = false;
    };

    enter(Args) {
        super.enter();
        console.log(Args);
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


        console.log("current_selection ", this.current_selection);
        console.log("previous_selection ", this.previous_selection);
    }

    game_logic() {

		let board = this.fsm.scene.board;
        let player = board.get_player();
        let player_symbol = (player == "white") ? "w" : "b";
        let current_symbol = board.get_cell_at(this.current_selection);

        if(this.previous_selection == null) {
            if(current_symbol == "t") {
                this.add_action = true;
                this.fsm.scene.interface.update_panel_info("ADD action | Pick white hexagon.");
            }
            else if(current_symbol != "0") {
                if(current_symbol == player_symbol) {
                    this.move_action = true;
                    this.fsm.scene.interface.update_panel_info("MOVE action | Pick adjacent piece");
                }
                else {
                    this.fsm.scene.interface.update_panel_info("Can't move opponent's piece.");
                    this.current_selection = null;
                }
            }
            else {
                this.fsm.scene.info = "";
                this.current_selection = null;
            }
            return;
        }

        if(this.add_action) {
            if(current_symbol == "0") {
                this.fsm.scene.info = "";
                this.fsm.switch_state("MOVE", ['add', this.previous_selection, this.current_selection]);            
            }
            else {
                this.fsm.scene.interface.update_panel_info("Invalid add action.");
            }
            this.add_action = false;
            this.previous_selection = null;
            this.current_selection = null;
            return;
        }

        if(this.move_action) {
            if(current_symbol != "0" && current_symbol != "t") {
                this.fsm.scene.interface.update_panel_info("");
                this.fsm.switch_state("MOVE", ['move', this.previous_selection, this.current_selection]);
            }
            else {
                this.fsm.scene.interface.update_panel_info("Invalid move action.");
            }
            this.move_action = false;
            this.previous_selection = null;
            this.current_selection = null;
        }
    }

    exit() {
        super.exit();
    }

    action_success(data) {

        if(data !== 'Bad Request')
            this.fsm.switch_state("UPDATE", data);
    }
}