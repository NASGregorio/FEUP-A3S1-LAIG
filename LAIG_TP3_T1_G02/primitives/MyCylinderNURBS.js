/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCylinderNURBS
{
    constructor(scene, base, top, height, slices, stacks)
    {
        this.scene = scene;

        var controlpoints = [
            [
                [ base, 0, 0, 1 ],
                [ base, 0, base, 1 ],
                [ 0, 0, base, 1 ]
            ],
            [
                [ top, height, 0, 1 ],
                [ top, height, top, 1 ],
                [ 0, height, top, 1 ]
            ]
        ];
        
        this.quarterCylinder = new MyNURBSObject(scene, stacks, slices/4, 1, 2, controlpoints);
    }

    display()
	{
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 1, 0, 0);

        for (let index = 0; index < 4; index++)
        {
            this.scene.pushMatrix();
            this.scene.rotate(index * Math.PI/2, 0, 1, 0);
            this.quarterCylinder.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
    
    
    updateTexCoords(length_s, length_t) {
        for (let index = 0; index < 4; index++)
            this.quarterCylinder.updateTexCoords(length_s, length_t);
	}
}