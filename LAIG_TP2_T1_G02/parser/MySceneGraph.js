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