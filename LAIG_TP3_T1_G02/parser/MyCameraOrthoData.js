/**
 * MyBoard
 * @constructor
 */
class MyCameraOrthoData extends AbstractCameraData{
    
	constructor(leftBound, rightBound, bottomBound, topBound, nearPlane, farPlane, position, upVector) {

        super(nearPlane, farPlane, position, target);

        this.leftBound = leftBound;
        this.rightBound = rightBound;
        this.bottomBound = bottomBound;
        this.topBound = topBound;

        this.upVector = vec3.clone(upVector);
    }
}