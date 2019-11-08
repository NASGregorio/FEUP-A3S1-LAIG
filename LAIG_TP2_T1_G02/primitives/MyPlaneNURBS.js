/**
 * MyPlaneNURBS
 * @constructor
 * @param scene - Reference to MyScene object
 * @param npartsU - Scale of rectangle in X
 * @param npartsV - Scale of rectangle in Y
 */
class MyPlaneNURBS
{
    constructor(scene, npartsU, npartsV)
    {
        
        var controlPoints = [
            [
                [-0.5, 0, 0.5, 1],
                [-0.5, 0, -0.5, 1]
            ],
            [
                [0.5,0,0.5,1],
                [0.5,0,-0.5,1]
            ]
        ];

        this.plane = new MyNURBSObject(
			scene,
			npartsU, npartsV,
			1, 1, 
			controlPoints
        );

    }

    display()
    {
        this.plane.display();
    }
}