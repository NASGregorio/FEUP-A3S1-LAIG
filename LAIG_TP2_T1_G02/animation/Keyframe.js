/**
 * Keyframe
 * @constructor
 * @param time - time instant
 * @param position - position
 * @param rotation - rotation
 * @param scale - scale
 */
class Keyframe
{
	constructor(time, position, rotation, scale) {
		this.time = time;
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
	}

	lerpKeyframe(a, b, perc) {
		var keyframe = new Keyframe(0, [], [], []);

        keyframe.position[0] = a.position[0]  + perc * (b.position[0] -  a.position[0]);
        keyframe.position[1] = a.position[1]  + perc * (b.position[1] -  a.position[1]);
        keyframe.position[2] = a.position[2]  + perc * (b.position[2] -  a.position[2]);

        keyframe.rotation[0] = a.rotation[0]  + perc * (b.rotation[0] -  a.rotation[0]);
        keyframe.rotation[1] = a.rotation[1]  + perc * (b.rotation[1] -  a.rotation[1]);
        keyframe.rotation[2] = a.rotation[2]  + perc * (b.rotation[2] -  a.rotation[2]);

        keyframe.scale[0]    = a.scale[0]     + perc * (b.scale[0] -  a.scale[0]);
        keyframe.scale[1]    = a.scale[1]     + perc * (b.scale[1] -  a.scale[1]);
        keyframe.scale[2]    = a.scale[2]     + perc * (b.scale[2] -  a.scale[2]);
		
		return keyframe;
	}
}