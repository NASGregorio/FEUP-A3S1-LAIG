var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {

        this.lightSwitches = [];

        this.graph.lights.forEach((value, key) => {
            var light = value;
            var i = light[0];

            this.lights[i].setPosition(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setAmbient(light[4][0], light[4][1], light[4][2], light[4][3]);
            this.lights[i].setDiffuse(light[5][0], light[5][1], light[5][2], light[5][3]);
            this.lights[i].setSpecular(light[6][0], light[6][1], light[6][2], light[6][3]);

            this.lights[i].setConstantAttenuation(light[7]);
            this.lights[i].setLinearAttenuation(light[8]);
            this.lights[i].setQuadraticAttenuation(light[9]);

            if (light[2] == "spot") {
                this.lights[i].setSpotCutOff(light[10]);
                this.lights[i].setSpotExponent(light[11]);
                this.lights[i].setSpotDirection(light[12][0], light[12][1], light[12][2]);
            }

            this.lights[i].setVisible(true);
            if (light[1])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lightSwitches.push(light[1] ? true : false);


            this.interface.addLight(this.lightSwitches, i, key);

            this.lights[i].update();
        });
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();
        
        this.camera = this.graph.views.get(this.graph.defaultView);
        this.interface.setActiveCamera(this.camera);

        this.sceneInited = true;
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if(this.axis)
            this.axis.display();

        if (this.sceneInited) {

            for (var i = 0; i < this.lights.length; i++) {
                if(this.lightSwitches[i]) {
                    this.lights[i].enable();
                } else {
                    this.lights[i].disable();
                }
                this.lights[i].update();
            }

            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}