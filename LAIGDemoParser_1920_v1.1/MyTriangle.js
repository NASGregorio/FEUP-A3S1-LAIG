/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of trinagle in X
 * @param y - Scale of triangle in Y
 */
class MyTriangle extends CGFobject {
	constructor(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);
		this.x1 = x1;
        this.x2 = x2;
		this.x3 = x3;
        this.y1 = y1;
        this.y2 = y2;
		this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];

		var p1 = vec3.fromValues(this.x1, this.y1, this.z1);
		var p2 = vec3.fromValues(this.x2, this.y2, this.z2);
		var p3 = vec3.fromValues(this.x3, this.y3, this.z3);

		var v1 = vec3.create(); //p1-p2 - a
		var v2 = vec3.create(); //p1-p3 - b
		var v3 = vec3.create(); //p2-p3 - c
		var perp = vec3.create();

		vec3.subtract(v1, p1, p2);
		vec3.subtract(v2, p1, p3);
		vec3.subtract(v3, p2, p3);
		vec3.cross(perp, v1, v2);
		vec3.normalize(perp, perp);

		this.normals = [];
		this.normals.push(perp[0], perp[1], perp[2]);
		this.normals.push(perp[0], perp[1], perp[2]);
		this.normals.push(perp[0], perp[1], perp[2]);

		var a = Math.sqrt(vec3.dot(v1, v1));
		var b = Math.sqrt(vec3.dot(v3, v3));
		var c = Math.sqrt(vec3.dot(v2, v2));

		var cos = (a*a-b*b+c*c)/(2*a*c);
		var sin = Math.sqrt(1-cos*cos);

		this.aLen = a;
		this.cLen = c;
		this.cosA = cos;
		this.sinA = sin;

		this.unitTexCoords = [
			0, 1,
			this.aLen, 1,
			this.cLen*this.cosA, 1-this.cLen*this.sinA
		];
		this.texCoords = [];
		this.updateTexCoords(1, 1);
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the triangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(length_s, length_t) {
		this.texCoords[0] = this.unitTexCoords[0];
		this.texCoords[1] = this.texCoords[3] = this.unitTexCoords[1];
		this.texCoords[2] = this.unitTexCoords[2] / length_s;
		this.texCoords[4] = this.unitTexCoords[4] / length_s;
		this.texCoords[5] = this.unitTexCoords[5] / length_t;
		this.updateTexCoordsGLBuffers();
	}
}