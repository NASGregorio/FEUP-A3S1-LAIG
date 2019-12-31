/**
 * MyBoard
 * @constructor
 */
class MyBoard extends CGFobject {
    
	constructor(scene) {

        super(scene);
        
        this.game_state = null;

        this.OuterRadius = 0.5;
        this.InnerRadius = this.OuterRadius * 0.866025404;
        this.sqrt3 = Math.sqrt(3);
        this.player = "";


        this.init_materials(scene);

        this.hex = new CGFOBJModel(scene, 'models/RoundedHexagon.obj');
        this.piece = new CGFOBJModel(scene, 'models/RoundedPiece.obj');
    };

    init_materials(scene) {
        this.appearance = new CGFappearance(scene);
		this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
		this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
		this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
		this.appearance.setShininess(120);

        this.redMat = new CGFappearance(scene);
		this.redMat.setAmbient(0.3, 0.3, 0.3, 1);
		this.redMat.setDiffuse(0.7, 0.2, 0.2, 1);
		this.redMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.redMat.setShininess(120);
        
        this.whiteMat = new CGFappearance(scene);
		this.whiteMat.setAmbient(0.4, 0.4, 0.4, 1);
		this.whiteMat.setDiffuse(0.6, 0.6, 0.6, 1);
		this.whiteMat.setSpecular(0.0, 0.0, 0.0, 1);
        this.whiteMat.setShininess(120);
        
        this.blackMat = new CGFappearance(scene);
		this.blackMat.setAmbient(0.05, 0.05, 0.05, 1);
		this.blackMat.setDiffuse(0.1, 0.1, 0.1, 1);
		this.blackMat.setSpecular(0.0, 0.0, 0.0, 1);
		this.blackMat.setShininess(120);
    }

    update_board(game_state) {
        this.game_state = game_state;

        //this.print_board(data[0]);
    }

    update_adj(adj_tiles) {
        this.adj_tiles = adj_tiles;
    }

    get_board() {
        return this.game_state[0];
    }

    get_player() {
        return this.game_state[3];
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


    find_in_list(list, cell) {
        for (let i = 0; i < list.length; i++)
            if(cell[0] == list[i][0] && cell[1] == list[i][1])
                return true;
        return false;
    }
    
    display() {

        if(this.game_state == null)
            return;

        this.scene.pushMatrix();
        this.scene.translate(- (this.game_state[1]-1) * this.InnerRadius, 0, -(this.game_state[2]/2*this.InnerRadius*this.sqrt3));

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