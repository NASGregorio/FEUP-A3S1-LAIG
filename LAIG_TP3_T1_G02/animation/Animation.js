/**
 * Animation
 * @constructor
 * @param scene - Reference to MyScene object
 */
class Animation
{
	constructor(scene) {
        this.scene = scene;

        this.running = true;

        this.origin;
        this.target;
        this.current;
    }
    
    setAnimationValues(origin, target) {
        
        this.origin = origin;
        this.target = target;
        this.current = this.origin;
    }
    
    startAnimation() {
        this.running = true;
    }

    update(perc) {

        if(this.running == false)
            return "END";

        this.current = this.current.lerpKeyframe(this.origin, this.target, perc);
        
        if(perc >= 1)
        {
            this.current = this.target;
            this.running = false;
        }
    }

    apply() {
        this.scene.translate(this.current.position[0], this.current.position[1], this.current.position[2]);
        this.scene.rotate(this.current.rotation[0], 1, 0, 0);
        this.scene.rotate(this.current.rotation[1], 0, 1, 0);
        this.scene.rotate(this.current.rotation[2], 0, 0, 1);
        this.scene.scale(this.current.scale[0], this.current.scale[1], this.current.scale[2]);
    }
}