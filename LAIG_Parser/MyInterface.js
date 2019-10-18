/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.lights = this.gui.addFolder('Lights');
        this.lights.open();
        
        
        this.initKeys();
        
        return true;
    }
    

    addViews() {
        this.gui.add(this.scene, 'selectedView', this.scene.viewNamesToIndex).onChange(this.scene.onViewChanged.bind(this.scene)).name('Views');
    }

    addLight(lightSwitches, idx, id) {
        this.lights.add(lightSwitches, idx, lightSwitches[idx]).onChange(this.scene.onLightSwitched.bind(this.scene, idx)).name(id);          
    }

    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        if(event.key === 'm') {
            this.scene.graph.materialIndex++;
        }

        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}