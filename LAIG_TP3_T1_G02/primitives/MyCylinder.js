/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCylinder extends CGFobject
{
    constructor(scene, base, top, height, slices, stacks)
    {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers()
    {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.unitTexCoords = [];
        this.texCoords = [];

        var dTheta = 2 * Math.PI / this.slices;
        var dHeight = this.height / this.stacks;
        var currRadius;
        var currHeight;
        var sinTheta;
        var cosTheta;

        var slope = -this.height/(this.base-this.top);
        var perpSlope = -1/slope;

        for (var t = 0; t <= this.stacks; t++)
        {
            var theta = 0;
            currRadius = this.base - t * (this.base - this.top) / this.stacks;
            currHeight = t * dHeight;
            
            for (var l = 0; l <= this.slices; l++)
            {
                sinTheta = Math.sin(theta);
                cosTheta = Math.cos(theta);

                this.vertices.push( currRadius * sinTheta,
                                    currRadius * cosTheta,
                                    currHeight);

                this.normals.push(currRadius * sinTheta, currRadius * cosTheta, perpSlope);

                this.unitTexCoords.push(theta / (2 * Math.PI), currHeight/this.height);

                theta += dTheta;
            }
        }
        
        for (var i = 0; i < this.stacks; i++) {
            for (var j = i * this.slices + i; j < i * this.slices + i + this.slices; j++) {
                this.indices.push(j + 1, j, j + 1 + this.slices);
                this.indices.push(j + 1, j + 1 + this.slices, j + 2 + this.slices);
            }
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

    updateBuffers(slices) {
        this.slices = slices;
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}