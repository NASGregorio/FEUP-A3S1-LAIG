/**
 * MyPatchNURBS
 * @constructor
 * @param scene - Reference to MyScene object
 * @param npartsU - divisão em partes no domínio U
 * @param npartsV - divisão em partes no domínio V
 * @param npointsU - nº de pontos no domínio U
 * @param npointsV - nº de pontos no domínio V
 * @param controlpoints - array de control points (x,y,z)
 */

class MyPatchNURBS
{
    constructor(scene, npartsU, npartsV, npointsU, npointsV, controlvertexes)
    {
        if( controlvertexes.length != npointsU * npointsV )
        {
            console.log("Error: control points array length differs from expected");
            return;
        }
        
        var controlPoints = this.prepareControlPoints(controlvertexes, npointsU, npointsV);

        this.patch = new MyNURBSObject(
			scene,
			npartsU, npartsV,
			npointsU-1, npointsV-1, 
			controlPoints
        );
    }
    
    prepareControlPoints(controlvertexes, npointsU, npointsV)
    {
        var controlPoints = [];

        for(var u = 0; u < npointsU; u++)
        {
            controlPoints.push([]);
            for(var v = 0; v < npointsV; v++)
                controlPoints[u].push(controlvertexes[ u * npointsV + v ]);
        }

        return controlPoints;
    }

    display()
	{
        this.patch.display();
    }
    
    
    updateTexCoords(length_s, length_t) {
		this.patch.updateTexCoords(length_s, length_t);
	}
}

