/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MySphere extends CGFobject {
	constructor(scene, radius, nStacks, nSlices) {
        super(scene);
        this.radius = radius;
		this.nSlices = nSlices;
		this.nStacks = 2 * nStacks;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.unitTexCoords = [];
        this.texCoords = [];

        var theta = 0;
        var dTheta = Math.PI / (this.nStacks);
        var dPhi = Math.PI * 2 / this.nSlices;
        var cosPhi, sinPhi;
        var cosTheta, sinTheta;

        for (var i = 0; i <= this.nStacks; i++) {

            var phi = 0;
            cosTheta = Math.cos(theta);
            sinTheta = Math.sin(theta);

            for (var j = 0; j < this.nSlices; j++) {
                
                // Only make 1 vertex for poles
                if(i == 0 || i == this.nStacks)
                    break;

                cosPhi = Math.cos(phi);
                sinPhi = Math.sin(phi);

                var v = [   this.radius * sinTheta * sinPhi,
                            this.radius * sinTheta * cosPhi,
                            this.radius * cosTheta];

                var mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);

                this.vertices.push(v[0], v[1], v[2]);
                this.normals.push(v[0]/mag, v[1]/mag, v[2]/mag);
                this.unitTexCoords.push(j / this.nSlices, i / this.nStacks);

                phi += dPhi;
            }

            // Makes duplicate vertex for UV coords and pole vertex for triangle fan
            var v = [   this.radius * sinTheta * Math.sin(phi),
                        this.radius * sinTheta * Math.cos(phi),
                        this.radius * cosTheta];

            var mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);

            this.vertices.push(v[0], v[1], v[2]);
            this.normals.push(v[0]/mag, v[1]/mag, v[2]/mag);
            this.unitTexCoords.push(1, i / this.nStacks);

            theta += dTheta;
        }

        // triangulos para "nao-polos"
        for (var i = 0; i < this.nStacks - 2; i++) {
            for (var j = i * this.nSlices + i + 1; j < (i + 1) * this.nSlices + i + 1; j++) {
                this.indices.push(j + 1, j + 1 + this.nSlices, j);
                this.indices.push(j + 1, j + 2 + this.nSlices, j + 1 + this.nSlices);
            }
        }

        // triangulos para polos
        var lv = (this.vertices.length / 3) - 1;
        for(var i = 1; i <= this.nSlices; i++) {
            this.indices.push(0, (i==this.nSlices) ? 1 : i+1, i);
            this.indices.push(lv, (i==this.nSlices) ? lv - 1 : lv - i - 1, lv - i);
        }

        this.updateTexCoords(1, 1);

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(length_s, length_t) {
        
        for(var i = 0; i < this.unitTexCoords.length; i+=2) {
            this.texCoords[i] = this.unitTexCoords[i] / length_s;
            this.texCoords[i + 1] = this.unitTexCoords[i+1] / length_t;
        }

		// this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

