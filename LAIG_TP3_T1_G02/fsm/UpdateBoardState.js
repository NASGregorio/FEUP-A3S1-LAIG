class UpdateBoardState extends AbstractState {

    constructor(scene, name) {
        super(scene, name);

        this.do_once = false;
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

        if(!this.do_once) {
            this.fsm.switch_state(this.scene.states["MOVE"], ['add', [0,0], [2,0]]);
            this.do_once = true;
        }
    }
    
    do_stuff() {
		console.log("Do Stuff!");
    }
}