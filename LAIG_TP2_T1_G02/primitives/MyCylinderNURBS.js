/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCylinderNURBS
{
    constructor(scene, base, top, height, slices, stacks)
    {
        var degree1 = 3;
        var degree2 = 1;
        // var controlVertices = [
        //                         [
        //                             [ -0.5, -1.5, 0.0, 1 ],
        //                             [ -0.5,  1.5, 0.0, 1 ]
        //                         ],
        //                         [
        //                             [ 0.5, -1.5, 1.5, 1 ],
        //                             [ 0.5,  1.5, 1.5, 1 ]                             
        //                         ],
        //                         [
        //                             [ 0.5, -1.5, -1.5, 1 ],
        //                             [ 0.5,  1.5, -1.5, 1 ]                             
        //                         ],
        //                         [                             
        //                             [ -0.5, -1.5, 0.0, 1 ],
        //                             [ -0.5,  1.5, 0.0, 1 ]
        //                         ]
        // ];

        var controlVertices = this.prepareControlPoints(slices, stacks, height);

        this.cylinder = new MyNURBSObject(scene, 2, stacks, degree1, degree2, controlVertices);
    }

    prepareControlPoints(slices, stacks, height)
    {
        var controlPoints = [];

        var thetaStep = 2 * Math.PI / slices;
        var theta = 0;

        var heightStep = height / stacks;

        for(var u = 0; u < slices; u++)
        {
            console.log(u, theta);
            controlPoints.push([]);
            for(var v = 0; v < stacks; v++)
            {
                controlPoints[u].push([Math.cos(theta), Math.sin(theta), v * heightStep]);
                theta += thetaStep;
            }
            theta = 0;
        }

        return controlPoints;
    }

    
    display()
	{
		this.cylinder.display();
	}
}