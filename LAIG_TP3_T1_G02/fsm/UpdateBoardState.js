class UpdateBoardState extends AbstractState {

    constructor(scene, name) {
        super(scene, name);
    };

    init() {
        super.init();
        console.log("My custom init: ", this.name);
        PrologInterpreter.send_request("setup_pvp(GameState)", this.handle_reply.bind(this));

        this.scene.interface.show_turn_information(this);
    }

    handle_reply(data){
		this.response = data;
		PrologInterpreter.send_move([0,0], [2,0], data);
    }
    
    do_stuff() {
		console.log("Do Stuff!");
	}
}