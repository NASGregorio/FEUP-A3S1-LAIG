/**
 * MyBoard
 * @constructor
 */
class AbstractCameraData {
    
	constructor(nearPlane, farPlane, position, target) {
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.position = vec3.clone(position);
        this.target = vec3.clone(target);
    }

}