/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {

    /**
     * @constructor
     */
    constructor(filename, scene) {

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;
        
        // Try to parse the XML file
        this.parser = new MyParser(this, filename);

        this.materialIndex = 0;
    }
    
    load() {

        this.scene.gl.clearColor(this.background[0], this.background[1], this.background[2], this.background[3]);
        this.scene.setGlobalAmbientLight(this.ambient[0], this.ambient[1], this.ambient[2], this.ambient[3]);
		
        this.initCameras();
        this.initLights();

        this.scene.axis.length = this.referenceLength;
    }

    initLights() {

        // Array for lights' UI
        this.scene.lightSwitches = [];

        this.scene.interface.resetLights();

        // Setup lights with XML values
        this.lights.forEach((value, key) => {
            var light = value;
            var i = light[0];

            this.scene.lights[i].setPosition(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.scene.lights[i].setAmbient(light[4][0], light[4][1], light[4][2], light[4][3]);
            this.scene.lights[i].setDiffuse(light[5][0], light[5][1], light[5][2], light[5][3]);
            this.scene.lights[i].setSpecular(light[6][0], light[6][1], light[6][2], light[6][3]);

            this.scene.lights[i].setConstantAttenuation(light[7]);
            this.scene.lights[i].setLinearAttenuation(light[8]);
            this.scene.lights[i].setQuadraticAttenuation(light[9]);

            if (light[2] == "spot") {
                this.scene.lights[i].setSpotCutOff(light[10]);
                this.scene.lights[i].setSpotExponent(light[11]);
                this.scene.lights[i].setSpotDirection(light[12][0], light[12][1], light[12][2]);
            }

            this.scene.lights[i].setVisible(false);
            if (light[1]) {
                this.scene.lights[i].enable();
                this.scene.lightSwitches.push(true);                
            }
            else {
                this.scene.lights[i].disable();
                this.scene.lightSwitches.push(false);
            }
            
            // Create light UI
            this.scene.interface.addLight(this.scene.lightSwitches, i, key);

            // Update light to reflect changes
            this.scene.lights[i].update();
        });
    }

    initCameras() {
        
        this.scene.selectedView = 0;
        this.scene.viewNamesToIndex = {};
        this.scene.viewIndexToNames = {};

        var i = 0;
        this.views.forEach((value, key) => {
            this.scene.viewNamesToIndex[key] = i;
            this.scene.viewIndexToNames[i] = key;
            i++;
        });
        
        // Set camera to XML's default
        this.scene.selectedView = this.scene.viewNamesToIndex[this.defaultView];
        this.scene.onViewChanged();


        // Create camera UI
        this.scene.interface.addViews();
    }

    startAnimations() {

        this.animationsInUse.forEach(animationID => {
    
            var animation = this.animations.get(animationID);
            animation.advanceKeyframe();
            animation.startAnimation();
            
        });

        // for (var k = 0; k < this.animationsInUse.size; k++) {

        // }
    }

    update(dt) {
        // Update animations
        this.animationsInUse.forEach(animationID => {
            this.animations.get(animationID).updateKeyframe(dt*this.scene.timeFactor);
        });


        // for (var k = 0; k < this.animationsInUse.size; k++) {
        // }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.traverseGraph(this.idRoot, null, null, 0);
    }

    traverseGraph(currentNodeName, parentMaterialName, parentTextureInfo, depth) {
        // var depthStr = "";
        // for(var i = 0; i < depth; i++) { depthStr = depthStr.concat(' '); }
        // console.log(depthStr + currentNodeName);
        // depth++;
        
        // Get current node
        var node = this.components.get(currentNodeName);

        // Check if valid
        if(node == null) {
            console.log("Invalid node: " + currentNodeName);
            return;
        }
 
        // Calculate material index
        var thisMatIndex = this.materialIndex % node.materials.length;

        // Calculate material based on inheritance
        var matName = (node.materials[thisMatIndex] != "inherit") ? 
        node.materials[thisMatIndex] :
        parentMaterialName;
        
        // Calculate texture based on inheritance
        var texInfo = [];
        switch (node.texture[0]) {
            case "inherit":
                texInfo = parentTextureInfo;
                break;
            case "none":
                texInfo = ["none", null, null];
                break;
            default:
                texInfo = node.texture;
                break;
        }
        
        // Recursive call for children nodes
        node.componentRefs.forEach(childName => {
            this.scene.pushMatrix();

            this.scene.multMatrix(this.transformations.get(node.transformationref));
            
            var animation = this.animations.get(node.animationRef);
            if(animation != null)
                animation.apply();
                
            this.traverseGraph(childName, matName, texInfo, depth);
            this.scene.popMatrix();
        });
        
        // Display call for primitives
        node.primitiveRefs.forEach(childName => {
            this.scene.pushMatrix();

            this.scene.multMatrix(this.transformations.get(node.transformationref));

            var animation = this.animations.get(node.animationRef);
            if(animation != null)
                animation.apply();
            
            this.materials.get(matName).setTexture(this.textures.get(texInfo[0]));
            this.materials.get(matName).apply();
            this.materials.get(matName).setTextureWrap('REPEAT', 'REPEAT');

            //this.primitives.get(childName).enableNormalViz();

            this.primitives.get(childName).updateTexCoords(texInfo[1], texInfo[2]);
            this.primitives.get(childName).display();
            
            this.scene.popMatrix();
        });
    }
}