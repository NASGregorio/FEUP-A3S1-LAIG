/**
 * Animation
 * @constructor
 * @param scene - Reference to MyScene object
 */
class KeyframeAnimation extends Animation
{
	constructor(scene) {
        super(scene);

        this.keyframes = [];
        this.keyframeCount = 0;
        this.currKeyframe = 0;

        var zeroKey = new Keyframe(0, [0,0,0], [0,0,0], [1,1,1]);
        this.addKeyframe(zeroKey);

        this.timeInterval = 0;
        this.totalTimeElapsed = 0;
        this.keyframeTimeElapsed = 0;

        this.finished = false;

        this.onFinish = null;
    }

    resetAnimation() {
        this.running = false;
        this.finished = false;
        this.currKeyframe = 0;
        this.timeInterval = 0;
        this.totalTimeElapsed = 0;
        this.keyframeTimeElapsed = 0;
    }

    setOnFinishCB(onFinish) {
        this.onFinish = onFinish;
    }
    
    addKeyframe(keyframe) {

        if(this.keyframeCount > 0 && keyframe.time < this.keyframes[this.keyframeCount-1].time) 
            return "Can't add keyframe from past instant. | New time: " + keyframe.time + " | Latest time: " + this.keyframes[this.keyframeCount-1].time;

        if(this.keyframeCount == 1 && keyframe.time == 0) {
            this.keyframes[0] = keyframe;
        }
        else {
            this.keyframes.push(keyframe);
            this.keyframeCount++;
        }
    }

    clearKeyframes() {
        this.keyframes = [];
        this.keyframeCount = 0;
        this.currKeyframe = 0;

        var zeroKey = new Keyframe(0, [0,0,0], [0,0,0], [1,1,1]);
        this.addKeyframe(zeroKey);

        this.timeInterval = 0;
        this.totalTimeElapsed = 0;
        this.keyframeTimeElapsed = 0;

        this.finished = false;

        this.onFinish = null;
    }

    updateKeyframe(dt) {
        
        if(this.finished == true)
            return;

        this.totalTimeElapsed += (dt/1000);
        this.keyframeTimeElapsed += (dt/1000);

        var res = this.update(this.keyframeTimeElapsed / this.timeInterval);

        if(res === "END") {
            this.advanceKeyframe();
            this.startAnimation();
        }
    }

    advanceKeyframe() {

        if(this.currKeyframe == this.keyframeCount-1) {
            this.finished = true;
            
            if(this.onFinish)
                this.onFinish();
            return;
        }
        
        var curr = this.keyframes[this.currKeyframe];
        var next = this.keyframes[++this.currKeyframe];
        
        this.timeInterval = next.time - curr.time;
        this.keyframeTimeElapsed = 0;
        
        this.setAnimationValues(curr, next);

    }
}