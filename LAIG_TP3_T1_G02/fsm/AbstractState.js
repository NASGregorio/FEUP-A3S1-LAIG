class AbstractState {

    constructor(fsm, name) {

        if (new.target === AbstractState) {
            throw new TypeError("Cannot construct AbstractStates directly");
        }

        this.fsm = fsm;
        this.scene = fsm.scene;
        this.name = name;
    };

    enter() {
        console.log("Entering ", this.name);
    }

    exit() {
        console.log("Exiting ", this.name);
    }
}