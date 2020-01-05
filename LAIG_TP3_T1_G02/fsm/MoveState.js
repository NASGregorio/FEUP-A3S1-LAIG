class MoveState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);

        this.data = null;
        this.animation_running = false;

        this.animation1 = new KeyframeAnimation(this.fsm.scene);
        this.animation2 = new KeyframeAnimation(this.fsm.scene);
        // let key_start = new Keyframe(0, [0,15,0], [0,0,0], [0,0,0]);
        // this.animation1.addKeyframe(key_start);
        // this.animation2.addKeyframe(key_start);
    };

    enter(args) {

        this.fsm.scene.interface.update_panel_info("");

        this.fsm.scene.board.update_last_move(args);

        if(args[0] == "stack")
            PrologInterpreter.send_stack_action(args[1][2], this.scene.board.game_state, this.action_success.bind(this));
        else
            PrologInterpreter.send_action(args[0], args[1], args[2], this.scene.board.game_state, this.action_success.bind(this));

        super.enter();
    }

    update(dt) {
        if(!this.animation_running)
            return;

        this.animation1.updateKeyframe(dt);
        this.animation2.updateKeyframe(dt);
    }

    display() {
        if(!this.animation_running)
            return;

        //this.fsm.scene.translate(this.fsm.scene.board.board_origin_x, 0,this.fsm.scene.board.board_origin_y);

        this.fsm.scene.pushMatrix();
        this.animation1.apply();
        this.fsm.scene.board.blackMat.apply(); //TODO pick color from player blah blah
        this.fsm.scene.board.piece.display();
        this.fsm.scene.popMatrix();
        
        this.fsm.scene.pushMatrix();
        this.fsm.scene.board.redMat.apply();
        this.animation2.apply();
        this.fsm.scene.board.hex.display();
        this.fsm.scene.popMatrix();
    }

    exit() {
        super.exit();
        this.data = null;
        this.animation_running = false;

        this.fsm.scene.move_camera();
    }

    action_success(data) {

        if(data !== 'Bad Request') {

            if(this.fsm.scene.game_mode != "PvsP") {
                this.fsm.scene.setPickEnabled(this.fsm.bot_turn);
                this.fsm.bot_turn = !this.fsm.bot_turn;
            }

            this.data = data;
            this.animate_piece_placement();
        }
        else {
            this.fsm.switch_state("INPUT");
        }
    }

    onAnimationFinish() {
        this.animation1.clearKeyframes();
        this.animation2.clearKeyframes();
        this.fsm.scene.board.save_state(this.data);
        this.fsm.switch_state("UPDATE", this.data);
    }

    set_stack_animation(last_move) {
        // Clear old piece
        let row = last_move[1][0][0];
        let col = last_move[1][0][1];
        board[row][col] = "t";

        // Get world space coordinates
        let origin = this.fsm.scene.board.coords_to_world_space([col, row]);
        let destination = this.fsm.scene.board.coords_to_world_space([last_move[1][1][1], last_move[1][1][0]]);  

        this.set_stack_animation(origin, destination);

        // Move to animation method + "beautify" TODO
        key_origin_start = new Keyframe(0, [origin[0], 4+0.1, origin[1]], [0,0,0], [1,1,1]);
        key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1, origin[1]], [0,0,0], [0,0,0]);

        key_destination_start = new Keyframe(0, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [0,0,0]);
        key_destination_end = new Keyframe(animation_time, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [1,1,1]);
    }

    set_add_animation(last_move) {
        
    }

    set_move_animation(last_move) {
        
    }

    animate_piece_placement() {

        let board = this.fsm.scene.board.get_board();
        let last_move = this.fsm.scene.board.last_move;

        let animation_time = 0.5;

        let move = last_move[0];
        console.log(move);

        // let key_origin_start;
        // let key_origin_end;
        // let key_destination_start;
        // let key_destination_end;


        switch (move) {
            case "stack":
                this.set_stack_animation(last_move);
                break;
            case "add":
                this.set_add_animation(last_move);
                break;
            case "move":
                this.set_move_animation(last_move);
                break;
            default:
                this.fsm.scene.board.save_state(this.data);
                this.fsm.switch_state("UPDATE", this.data);
                break;
        }

        // if(move == "stack") {

        //     // Clear old piece
        //     let row = last_move[1][0][0];
        //     let col = last_move[1][0][1];
        //     board[row][col] = "t";

        //     // Get world space coordinates
        //     let origin = this.fsm.scene.board.coords_to_world_space([col, row]);
        //     let destination = this.fsm.scene.board.coords_to_world_space([last_move[1][1][1], last_move[1][1][0]]);  

        //     this.set_stack_animation(origin, destination);

        //     // Move to animation method + "beautify" TODO
        //     key_origin_start = new Keyframe(0, [origin[0], 4+0.1, origin[1]], [0,0,0], [1,1,1]);
        //     key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1, origin[1]], [0,0,0], [0,0,0]);

        //     key_destination_start = new Keyframe(0, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [0,0,0]);
        //     key_destination_end = new Keyframe(animation_time, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [1,1,1]);

        // }
        // else if(move == "add") {

        //     origin = this.fsm.scene.board.coords_to_world_space(last_move[1]);
        //     destination = this.fsm.scene.board.coords_to_world_space(last_move[2]);

        //     key_origin_start = new Keyframe(0, [origin[0], 4+0.1, origin[1]], [0,0,0], [0,0,0]);
        //     key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1, origin[1]], [0,0,0], [1,1,1]);

        //     key_destination_start = new Keyframe(0, [destination[0], 4, destination[1]], [0,0,0], [0,0,0]);
        //     key_destination_end = new Keyframe(animation_time, [destination[0], 4, destination[1]], [0,0,0], [1.2,1.2,1.2]);
        // }


        // this.animation1.addKeyframe(key_origin_start);
        // this.animation1.addKeyframe(key_origin_end);
        
        // this.animation2.addKeyframe(key_destination_start);
        // this.animation2.addKeyframe(key_destination_end);

        // this.animation1.setOnFinishCB(this.onAnimationFinish.bind(this));
        // this.animation1.resetAnimation();
        // this.animation1.advanceKeyframe();
        // this.animation1.startAnimation();
        
        // this.animation2.setOnFinishCB(null);
        // this.animation2.resetAnimation();
        // this.animation2.advanceKeyframe();
        // this.animation2.startAnimation();

        //this.animation_running = true;
    }
}