/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MySphere extends CGFobject {
	constructor(scene, nStacks, nSlices) {
		super(scene);
		this.nStacks = 2 * nStacks;
		this.nSlices = nSlices;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
        this.indices = [];
        this.normals = [];

        var theta = 0;
        var phi = 0;
        var dTheta = Math.PI / (this.nStacks);
        var dPhi = Math.PI * 2 / this.nSlices;

        for (var i = 0; i <= this.nStacks; i++) {
            for (var j = 0; j < this.nSlices; j++) {
                
                var v = [   Math.sin(theta) * Math.sin(phi),
                            Math.sin(theta) * Math.cos(phi),
                            Math.cos(theta)];

                var mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);

                this.vertices.push(v[0], v[1], v[2]);
                this.normals.push(v[0]/mag, v[1]/mag, v[2]/mag);

                if(i == 0 || i == this.nStacks)
                    break;

                phi += dPhi;
            }

            // triangulos para "nao-polos"
            if(i > 0 && i < this.nStacks - 1)
            {
                for (var v = (i-1) * this.nSlices + 1; v < i * this.nSlices; v++) {
                    this.indices.push(v + 1, v + this.nSlices, v);
                    this.indices.push(v + 1, v + this.nSlices + 1, v + this.nSlices);
                }
                this.indices.push(1+this.nSlices*(i-1), this.nSlices * (i + 1), this.nSlices*i);
                this.indices.push(1+this.nSlices*(i-1), this.nSlices*i + 1, this.nSlices * (i + 1));
            }
            theta += dTheta;
        }

        // triangulos para polos
        var lv = (this.vertices.length / 3) - 1;
        for(var i = 1; i <= this.nSlices; i++) {
            this.indices.push(0, (i==this.nSlices) ? 1 : i+1, i);
            this.indices.push(lv, (i==this.nSlices) ? lv - 1 : lv - i - 1, lv - i);
        }
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

