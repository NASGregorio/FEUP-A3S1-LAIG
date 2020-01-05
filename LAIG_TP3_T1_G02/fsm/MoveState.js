class MoveState extends AbstractState {

    constructor(fsm, name) {
        super(fsm, name);

        this.data = null;
        this.animation_running = false;

        this.animation1 = { "anim": new KeyframeAnimation(this.fsm.scene), "material":null, "obj":null };
        this.animation2 = { "anim": new KeyframeAnimation(this.fsm.scene), "material":null, "obj":null };
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

        this.animation1.anim.updateKeyframe(dt);
        this.animation2.anim.updateKeyframe(dt);
    }

    display() {
        if(!this.animation_running)
            return;

        //this.fsm.scene.translate(this.fsm.scene.board.board_origin_x, 0,this.fsm.scene.board.board_origin_y);

        this.fsm.scene.pushMatrix();
        this.animation1.anim.apply();
        this.animation1.material.apply(); //TODO pick color from player blah blah
        this.animation1.obj.display();
        this.fsm.scene.popMatrix();
        
        this.fsm.scene.pushMatrix();
        this.animation2.anim.apply();
        this.animation2.material.apply();
        this.animation2.obj.display();
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
        this.animation1.anim.clearKeyframes();
        this.animation2.anim.clearKeyframes();
        this.fsm.scene.board.save_state(this.data);
        this.fsm.switch_state("UPDATE", this.data);
    }

    set_stack_animation(board, last_move, player) {

        let animation_time = 0.5;

        // Clear old piece
        let row = last_move[1][0][0];
        let col = last_move[1][0][1];
        board[row][col] = "t";

        // Get world space coordinates
        let origin = this.fsm.scene.board.coords_to_world_space([col, row]);
        let destination = this.fsm.scene.board.coords_to_world_space([last_move[1][1][1], last_move[1][1][0]]);  

        // Move to animation method + "beautify" TODO
        let key_origin_start = new Keyframe(0, [origin[0], 4+0.1, origin[1]], [0,0,0], [1,1,1]);
        let key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1, origin[1]], [0,0,0], [0,0,0]);

        let key_destination_start = new Keyframe(0, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [0,0,0]);
        let key_destination_end = new Keyframe(animation_time, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [1,1,1]);

        this.animation1.anim.addKeyframe(key_origin_start);
        this.animation1.anim.addKeyframe(key_origin_end);
        
        this.animation2.anim.addKeyframe(key_destination_start);
        this.animation2.anim.addKeyframe(key_destination_end);

        this.animation2.material = (player == "white") ? this.fsm.scene.board.whiteMat : this.fsm.scene.board.blackMat;
        this.animation2.obj = this.fsm.scene.board.piece;
    }

    set_add_animation(last_move) {
        
        let animation_time = 0.5;

        let origin = this.fsm.scene.board.coords_to_world_space(last_move[1]);
        let destination = this.fsm.scene.board.coords_to_world_space(last_move[2]);

        let dst_length = vec2.length(vec2.fromValues(destination[0],destination[1]));

        if(vec2.distance(vec2.fromValues(destination[0], destination[1]), vec2.fromValues(this.fsm.scene.board.board_offset_x, this.fsm.scene.board.board_offset_x)) > 10) {
            this.fsm.scene.board.board_offset_x += (destination[0] / dst_length)*-1;
            this.fsm.scene.board.board_offset_y += (destination[1] / dst_length)*-1;
        }

        let key_origin_start = new Keyframe(0, [origin[0], 4+0.1, origin[1]], [0,0,0], [0,0,0]);
        let key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1, origin[1]], [0,0,0], [1,1,1]);

        let key_destination_start = new Keyframe(0, [destination[0], 4, destination[1]], [0,0,0], [0,0,0]);
        let key_destination_end = new Keyframe(animation_time, [destination[0], 4, destination[1]], [0,0,0], [2.2,2.2,2.2]);

        this.animation1.anim.addKeyframe(key_origin_start);
        this.animation1.anim.addKeyframe(key_origin_end);
        
        this.animation2.anim.addKeyframe(key_destination_start);
        this.animation2.anim.addKeyframe(key_destination_end);

        this.animation2.material = this.fsm.scene.board.redMat;
        this.animation2.obj = this.fsm.scene.board.hex;
    }

    set_move_animation(board, last_move, player) {
        let animation_time = 0.5;

        let row = last_move[1][1];
        let col = last_move[1][0];

        console.log(board[row]);

        let height = board[row][col].length;

        if(height == 1)
            board[row][col] = "t";

        let origin = this.fsm.scene.board.coords_to_world_space(last_move[1]);
        let destination = this.fsm.scene.board.coords_to_world_space(last_move[2]);

        // Move to animation method + "beautify" TODO
        let key_origin_start = new Keyframe(0, [origin[0], 4+0.1+height*0.2, origin[1]], [0,0,0], [1,1,1]);
        let key_origin_end = new Keyframe(animation_time, [origin[0], 4+0.1+height*0.2, origin[1]], [0,0,0], [0,0,0]);

        let key_destination_start = new Keyframe(0, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [0,0,0]);
        let key_destination_end = new Keyframe(animation_time, [destination[0], 4+0.1+0.2, destination[1]], [0,0,0], [1,1,1]);

        this.animation1.anim.addKeyframe(key_origin_start);
        this.animation1.anim.addKeyframe(key_origin_end);
        
        this.animation2.anim.addKeyframe(key_destination_start);
        this.animation2.anim.addKeyframe(key_destination_end);

        this.animation2.material = (player == "white") ? this.fsm.scene.board.whiteMat : this.fsm.scene.board.blackMat;
        this.animation2.obj = this.fsm.scene.board.piece;
    }

    animate_piece_placement() {

        let board = this.fsm.scene.board.get_board();
        let player = this.fsm.scene.board.get_player();
        let last_move = this.fsm.scene.board.last_move;

        switch (last_move[0]) {
            case "stack":
                this.set_stack_animation(board, last_move, player);
                break;
            case "add":
                this.set_add_animation(last_move);
                break;
            case "move":
                this.set_move_animation(board, last_move, player);
                break;
            default:
                this.fsm.scene.board.save_state(this.data);
                this.fsm.switch_state("UPDATE", this.data);
                return;
                break;
        }

        this.animation1.material = (player == "white") ? this.fsm.scene.board.whiteMat : this.fsm.scene.board.blackMat;
        this.animation1.obj = this.fsm.scene.board.piece;

        
        console.log(this.animation1);
        console.log(this.animation2);

        this.animation1.anim.setOnFinishCB(this.onAnimationFinish.bind(this));
        this.animation1.anim.resetAnimation();
        this.animation1.anim.advanceKeyframe();
        this.animation1.anim.startAnimation();
        
        this.animation2.anim.setOnFinishCB(null);
        this.animation2.anim.resetAnimation();
        this.animation2.anim.advanceKeyframe();
        this.animation2.anim.startAnimation();

        this.animation_running = true;
    }

    center_board() {

    }
}