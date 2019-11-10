
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

        this.sceneInited = false;
    }
    
    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);
    }
    
    /**
     * Initializes the scene cameras.
     */
    initCameras() {

        // Arrays for camera UI selection
        this.selectedView = 0;
        this.viewNamesToIndex = {};
        this.viewIndexToNames = {};

        var i = 0;
        this.graph.views.forEach((value, key) => {
            this.viewNamesToIndex[key] = i;
            this.viewIndexToNames[i] = key;
            i++;
        });
        
        // Create camera UI
        this.interface.addViews();

        // Set camera to XML's default
        this.camera = this.graph.views.get(this.graph.defaultView);
        this.interface.setActiveCamera(this.camera);

        this.rtt = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);

        this.securityCamera = new MySecurityCamera(this, this.rtt);

    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {

        // Array for lights' UI
        this.lightSwitches = [];

        // Setup lights with XML values
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
            if (light[1]) {
                this.lights[i].enable();
                this.lightSwitches.push(true);                
            }
            else {
                this.lights[i].disable();
                this.lightSwitches.push(false);
            }
            
            // Create light UI
            this.interface.addLight(this.lightSwitches, i, key);

            // Update light to reflect changes
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
        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.setUpdatePeriod(1000/60);

        this.lastUpdate = Date.now();

        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;



        
        // Start animations
        this.graph.startAnimations();
    }

    /**
     * Callback for camera switching UI
     */
    onViewChanged() {
        this.camera = this.graph.views.get(this.viewIndexToNames[this.selectedView]);
        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Callback for light switching UI
     */
    onLightSwitched(i) {
        if(this.lightSwitches[i])
            this.lights[i].enable();
        else
            this.lights[i].disable();
        this.lights[i].update();
    }

    update(tNow) {
        var dt = tNow - this.lastUpdate;
        this.graph.update(dt);
    }

    display() {

        if (!this.sceneInited)
            return;

        this.rtt.attachToFrameBuffer();
        this.render(this.graph.views.get(this.viewIndexToNames[0]));
        this.rtt.detachFromFrameBuffer();

        this.render(this.graph.views.get(this.viewIndexToNames[this.selectedView]));

        this.gl.disable(this.gl.DEPTH_TEST);
        this.securityCamera.display();
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    /**
     * Displays the scene.
     */
    render(camera) {

        this.camera = camera;

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();
        
        // Show axis
        if(this.axis)
            this.axis.display();
        
        // Draw axis
        this.setDefaultAppearance();
        
        // Displays the scene (MySceneGraph function).
        this.pushMatrix();
        this.graph.displayScene();
        this.popMatrix();
    }
}