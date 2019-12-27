/**
 * MyBoard
 * @constructor
 */
class MyBoard extends CGFobject {
	constructor(scene) {

		super(scene);

        this.OuterRadius = 0.5;
        this.InnerRadius = this.OuterRadius * 0.866025404;

        this.hex = new CGFOBJModel(scene, 'models/RoundedHexagon.obj');

        this.redMat = new CGFappearance(scene);
		this.redMat.setAmbient(0.3, 0.3, 0.3, 1);
		this.redMat.setDiffuse(0.7, 0.2, 0.2, 1);
		this.redMat.setSpecular(0.0, 0.0, 0.0, 1);
		this.redMat.setShininess(120);
        
    };

    update_array(array) {
        this.array = array;
    }
    
    display() {

        if(this.array == null) {
            return;
        }

        this.redMat.apply();

        for (let i = 0; i < this.array.length; i++) {
            const row = this.array[i];

            this.scene.pushMatrix();
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];

                //console.log(cell);
                this.hex.display();
                this.scene.translate(this.InnerRadius*2, 0, 0);
            }
            this.scene.popMatrix();

            let offset = (i % 2 == 0) ? this.InnerRadius : -this.InnerRadius;
            this.scene.translate(offset, 0, this.InnerRadius*1.75);
        }
    }
};


/*
            // for (int r = 0; r < height; r++)
            // {
            //     int r_offset = r >> 1; // Floor(r/2);
            //     for (int q = -r_offset; q < width - r_offset; q++)
            //     {
            //         CreateCell(q, r, 0);
            //     }
            // }
*/