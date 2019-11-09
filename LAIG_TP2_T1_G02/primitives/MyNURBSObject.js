/**
 * MyNURBSObject
 * @constructor
 * @param scene - Reference to MyScene object
 * @param npartsU - divisão em partes no domínio U
 * @param npartsV - divisão em partes no domínio V
 * @param degree1 - grau no domínio U
 * @param degree2 - grau no domínio V
 * @param controlvertexes - array de control points (x,y,z)
 */
class MyNURBSObject
{
	constructor(scene, npartsU, npartsV, degree1, degree2, controlvertexes) {

		if(degree1 < 1 || degree2 < 1)
		{
			console.log("Error: Degrees must have a value of 1 or higher");
            return;
		}

		if(npartsU < 1 || npartsV < 1)
		{
			console.log("Error: Number of parts must have a value of 1 or higher");
            return;
		}

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);
				
		this.surface = new CGFnurbsObject( scene, npartsU, npartsV, nurbsSurface );

		this.unitTexCoords = this.surface.texCoords;
	}

	display()
	{
		this.surface.display();
	}

	updateTexCoords(length_s, length_t) {
        
        for(var i = 0; i < this.unitTexCoords.length; i+=2) {
            this.surface.texCoords[i] = this.unitTexCoords[i] / length_s;
            this.surface.texCoords[i + 1] = this.unitTexCoords[i+1] / length_t;
        }

		// this.texCoords = [...coords];
		this.surface.updateTexCoordsGLBuffers();
	}
}