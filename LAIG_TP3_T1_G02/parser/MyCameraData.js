/**
 * MyBoard
 * @constructor
 */
class MyCameraData extends AbstractCameraData {
    
	constructor(fov, nearPlane, farPlane, position, target) {
        super(nearPlane, farPlane, position, target);

        this.fov = fov;
    }
}