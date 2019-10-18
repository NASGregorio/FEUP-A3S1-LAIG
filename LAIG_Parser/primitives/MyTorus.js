/**
 *  torus centrado na origem, com raios interior e exterior variáveis (inner/outer radius) à volta do eixo Z
 * O torus deverá ter um número de “lados” (slices) variável à volta do raio interior, e um número de “voltas” (loops) à volta do eixo circular
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTorus extends CGFobject
{
    constructor(scene, inner, outer, slices, loops)
    {
        super(scene);
        this.slices = slices;
        this.loops = loops;
        this.inner = inner;
        this.outer = outer;
        this.initBuffers();
    }

    initBuffers()
    {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.unitTexCoords = [];
        this.texCoords = [];

        var alpha = 0;
        var thetaStep = 2 * Math.PI / this.slices;
        var alphaStep = 2 * Math.PI / this.loops;
        var cosAlpha, sinAlpha;
        var cosTheta, sinTheta;
        var v;

        //Outer loop
        for(var i = 0; i <= this.loops; i++){

            cosAlpha = Math.cos(alpha);
            sinAlpha = Math.sin(alpha);
            var theta = 0;

            //Inner loop
            for(var j = 0; j <= this.slices; j++){

                cosTheta = Math.cos(theta);
                sinTheta = Math.sin(theta);

                v = [   (this.outer + this.inner * cosTheta) * cosAlpha,
                            (this.outer + this.inner * cosTheta) * sinAlpha,
                            this.inner * sinTheta];

                this.vertices.push(...v);

                var cx = this.outer*cosAlpha;
                var cy = this.outer*sinAlpha;
                var cz = 0;

                this.normals.push(v[0]-cx, v[1]-cy, v[2]-cz);

                this.unitTexCoords.push(j / this.slices, i / this.loops);

                theta = theta + thetaStep;
            }
            
            alpha = alpha + alphaStep;
        }

        for (var k = 0; k < this.loops; k++) {
            for (var v = k * this.slices + k; v < k * (this.slices + 1) + this.slices; v++) {
                this.indices.push(v, v + 1 + this.slices, v + 1);
                this.indices.push(v + 1, v + 1 + this.slices, v + 2 + this.slices);
            }
        }

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