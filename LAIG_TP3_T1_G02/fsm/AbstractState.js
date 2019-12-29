class AbstractState {

    constructor(scene, name) {

        if (new.target === AbstractState) {
            throw new TypeError("Cannot construct AbstractStates directly");
        }

        this.scene = scene; 
        this.name = name;
    };

    init() {
        console.log(this.name);
    }
}