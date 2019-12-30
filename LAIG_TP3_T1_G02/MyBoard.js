/**
 * MyBoard
 * @constructor
 */
class MyBoard extends CGFobject {
    
	constructor(scene, rows, cols) {

		super(scene);

        this.OuterRadius = 0.5;
        this.InnerRadius = this.OuterRadius * 0.866025404;
        this.sqrt3 = Math.sqrt(3);

        this.init_materials(scene);
        
        // this.rows = rows;
        // this.cols = cols;
        // this.tiles = new Map();

        // for (let r = 0; r < this.rows; r++) {
        //     for (let c = 0; c < this.cols; c++) {
                
        //     }
        // }

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

    update_board(data) {
        this.scene.game_state = data;
        this.new_board = data[0];

        this.print_board(data[0]);
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

    }

    draw_cell(cell, idx, coords) {
        this.redMat.apply();
        this.scene.registerForPick(idx, this.hex);
        this.scene.pickIDs.set(idx, coords);
        this.hex.display();

        if(cell[0] === 't')
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
    
    display() {

        if(this.new_board == null)
            return;

        this.scene.pushMatrix();
        this.scene.translate(- (this.scene.game_state[1]-1) * this.InnerRadius, 0, -(this.scene.game_state[2]/2*this.InnerRadius*this.sqrt3));

        for (let i = 0; i < this.new_board.length; i++) {
            const row = this.new_board[i];

            this.scene.pushMatrix();
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];

                if(cell[0] != 0)
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