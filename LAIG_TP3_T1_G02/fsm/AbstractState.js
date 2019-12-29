class AbstractState {

    constructor(scene, name) {

        if (new.target === AbstractState) {
            throw new TypeError("Cannot construct AbstractStates directly");
        }

        this.scene = scene; 
        this.fsm = scene.fsm;
        this.name = name;
    };

    enter() {
        console.log("Entering ", this.name);
    }

    exit() {
        console.log("Exiting ", this.name);
    }
}