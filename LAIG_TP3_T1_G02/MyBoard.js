/**
 * MyBoard
 * @constructor
 */
class MyBoard extends CGFobject {
    
	constructor(scene) {

        super(scene);
        
        this.OuterRadius = 0.5;
        this.InnerRadius = this.OuterRadius * 0.866025404;
        this.sqrt3 = Math.sqrt(3);

        this.board_origin_x = 0;
        this.board_origin_y = 0;

        this.board_offset_x = 0;
        this.board_offset_y = 0;

        this.game_state = null;
        this.last_move = [];
        
        this.saved_game_states = [];
        this.redo_stack = [];

        this.start_time = 0;
        this.count = false;
        this.counter = 0;

        this.available_tiles = 24;

        this.init_materials(scene);
        this.init_models(scene);
    };

    init_materials(scene) {
        this.appearance = new CGFappearance(scene);
		this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
		this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
		this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
		this.appearance.setShininess(120);

        this.redMat = new CGFappearance(scene);
		this.redMat.setAmbient(0.0, 0.0, 0.0, 1);
		this.redMat.setDiffuse(0.6, 0.2, 0.2, 1);
		this.redMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.redMat.setShininess(120);
        
        this.whiteMat = new CGFappearance(scene);
		this.whiteMat.setAmbient(0.0, 0.0, 0.0, 1);
		this.whiteMat.setDiffuse(0.6, 0.6, 0.6, 1);
		this.whiteMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.whiteMat.setShininess(120);
        
        this.blackMat = new CGFappearance(scene);
		this.blackMat.setAmbient(0.0, 0.0, 0.0, 1);
		this.blackMat.setDiffuse(0.1, 0.1, 0.1, 1);
		this.blackMat.setSpecular(0.2, 0.2, 0.2, 1);
		this.blackMat.setShininess(120);
    }

    init_models(scene) {
        this.hex = new CGFOBJModel(scene, 'models/RoundedHexagon.obj');
        this.piece = new CGFOBJModel(scene, 'models/RoundedPiece.obj');
    }

    update_board(game_state) {
        this.game_state = game_state;

        this.available_blacks = 16 - this.game_state[8];
        this.available_whites = 16 - this.game_state[9];
        this.available_tiles = 28 - (this.game_state[4].length + this.game_state[5].length + this.game_state[6].length);
    }

    update(tNow) {
        if(this.count == true) {
            this.counter = Math.round((tNow - this.start_time)/1000);
            this.scene.interface.update_panel_time(this.counter);
        }
    }

    update_adj(adj_tiles) {
        this.adj_tiles = adj_tiles;
    }

    update_last_move(last_move) {
        this.last_move = last_move;
    }

    save_state(data) {
        this.saved_game_states.push(data);
        this.redo_stack = [];
    }

    replay(game_state) {
        this.update_board(game_state);
    }

    undo() {
        let undo_board = this.saved_game_states.pop();
        this.redo_stack.push(undo_board);
        return this.saved_game_states[this.saved_game_states.length-1];
    }

    redo() {
        let redo_board = this.redo_stack.pop();
        this.saved_game_states.push(redo_board);
        return redo_board;
    }

    get_board() {
        return this.game_state[0];
    }

    get_player() {
        return this.game_state[3];
    }

    get_cell_at(coords) {

        if(coords == null)
            return null;

        let row = coords[0];
        let col = coords[1];
        return this.game_state[0][row][col];
    }

    print_board(board) {

        let str = '';

        board.forEach(line => {
            str = str.concat('| ');
            line.forEach(element => {
                str = str.concat(element, ' | ');
            });
            str = str.concat('\n');
        });
        console.log(str);
    }

    get_all_occupied_tiles() {
        let all_tiles = this.game_state[4];
        all_tiles = all_tiles.concat(this.game_state[5]);
        all_tiles = all_tiles.concat(this.game_state[6]);
        return all_tiles;
    }

    draw_cell(cell, idx, coords) {

        if(cell[0] === 0)
            this.appearance.apply();
        else
            this.redMat.apply();

        this.scene.registerForPick(idx, this.hex);
        this.scene.pickIDs.set(idx, coords);
        this.hex.display();

        if(cell[0] === 't' || cell[0] === 0)
            return;

        for (let y = 0; y < cell.length; y++) {
                    
            this.scene.pushMatrix();

            if(cell[y] == "b")
                this.blackMat.apply();

            else if(cell[y] == "w")
                this.whiteMat.apply();

            this.scene.translate(0,0.1+0.2*(cell.length-1-y),0);
            this.piece.display();
            this.scene.popMatrix();
        }
    }

    coords_to_world_space(coords) {
        var x = this.OuterRadius * Math.sqrt(3) * (coords[0] + 0.5 * ((coords[1])&1));
        var y = this.OuterRadius * 3/2 * coords[1];
        return [x+this.board_origin_x+this.board_offset_x, y+this.board_origin_y+this.board_offset_y];
    }

    set_origin(data) {
        this.board_origin_x = - (data[1]-1) * this.InnerRadius;
        this.board_origin_y = - (data[2]/2*this.InnerRadius*this.sqrt3);
    }


    find_in_list(list, cell) {
        for (let i = 0; i < list.length; i++)
            if(cell[0] == list[i][0] && cell[1] == list[i][1])
                return true;
        return false;
    }

    display_extra_tiles() {

        this.redMat.apply();

        let radius = 8.5*2;
        let step = Math.PI / 12;
        for (let index = 0; index < this.available_tiles; index++) {
            let x = radius * Math.cos(index*step);
            let z = radius * Math.sin(index*step);
            this.scene.pushMatrix();
            this.scene.translate(x, -1.2, z);
            this.hex.display();
            this.scene.popMatrix();
        }
    }

    display_extra_pieces() {
        let radius = 8.5*2;
        let step = Math.PI / 12;

        this.blackMat.apply();
        for (let index = 0; index < this.available_blacks; index++) {
            let x = radius * Math.cos(step/2.75 + index*step);
            let z = radius * Math.sin(step/2.75 + index*step);
            this.scene.pushMatrix();
            this.scene.translate(x, -1.2, z);
            this.piece.display();
            this.scene.popMatrix();
        }

        this.whiteMat.apply();
        for (let index = 0; index < this.available_whites; index++) {
            let x = radius * Math.cos(-step/2.75 + index*step);
            let z = radius * Math.sin(-step/2.75 + index*step);
            this.scene.pushMatrix();
            this.scene.translate(x, -1.2, z);
            this.piece.display();
            this.scene.popMatrix();
        }
    }

    display() {

        if(this.game_state == null)
            return;

        this.scene.pushMatrix();
        
        if(this.scene.selectedScene == "casino")
            this.scene.translate(this.board_origin_x+this.board_offset_x, -0.2,this.board_origin_y+this.board_offset_y);

        else
            this.scene.translate(this.board_origin_x+this.board_offset_x, 0,this.board_origin_y+this.board_offset_y);

        for (let i = 0; i < this.game_state[0].length; i++) {
            const row = this.game_state[0][i];

            this.scene.pushMatrix();
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];

                if(cell[0] != 0 || (this.adj_tiles != null && this.find_in_list(this.adj_tiles, [j,i])) )
                    this.draw_cell(cell, j+i*row.length, [i,j]);

                this.scene.translate(this.InnerRadius*2, 0, 0);
            }
            this.scene.popMatrix();
            
            let offset = (i % 2 == 0) ? this.InnerRadius : -this.InnerRadius;
            this.scene.translate(offset, 0, this.InnerRadius*this.sqrt3);
        }

        this.scene.popMatrix();
    }
};