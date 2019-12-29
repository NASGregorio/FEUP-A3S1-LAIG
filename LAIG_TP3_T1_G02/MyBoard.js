/**
 * MyBoard
 * @constructor
 */
class MyBoard extends CGFobject {
    
	constructor(scene) {

		super(scene);

        this.OuterRadius = 0.5;
        this.InnerRadius = this.OuterRadius * 0.866025404;

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
    
    display() {

        if(this.new_board == null) {
            return;
        }

        // this.redMat.apply();
        let k = 1;
        for (let i = 0; i < this.new_board.length; i++) {
            const row = this.new_board[i];

            this.scene.pushMatrix();
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];

                for (let y = 0; y < cell.length; y++) {
                    if(cell[0] == "t")
                        this.redMat.apply();
                    
                    else if(cell[y] == "b") {
                        this.scene.pushMatrix();
                        this.scene.translate(0,0.1+0.2*y,0);
                        this.blackMat.apply();
                        this.piece.display();
                        this.scene.popMatrix();
                        this.redMat.apply();
                    }

                    else if(cell[y] == "w") {
                        this.scene.pushMatrix();
                        this.scene.translate(0,0.1+0.2*y,0);
                        this.whiteMat.apply();
                        this.piece.display();
                        this.scene.popMatrix();
                        this.redMat.apply();
                    }

                    else
                    this.appearance.apply();
                }

			    this.scene.registerForPick(k++, this.hex);
                this.hex.display();
                this.scene.translate(this.InnerRadius*2, 0, 0);
            }
            this.scene.popMatrix();

            let offset = (i % 2 == 0) ? this.InnerRadius : -this.InnerRadius;
            this.scene.translate(offset, 0, this.InnerRadius*1.75);
        }
    }
};