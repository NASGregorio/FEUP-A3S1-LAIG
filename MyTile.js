/**
 * MyTile
 * @constructor
 */
class MyTile  {
    
	constructor(x, z) {

        this.x = x;
        this.z = z;
        this.visible = false;
        
        this.pieces = [];
    };

    add_piece(piece) {
        this.pieces.push(piece);
    }

};