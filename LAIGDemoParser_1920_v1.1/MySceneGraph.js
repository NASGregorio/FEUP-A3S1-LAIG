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

        this.count = 0;
        this.matIndex = 0;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        ////////////////////////////
        // DEBUG
        // this.count++;
        
        // if(this.count >= 60) {
        //     this.count = 0;
        //     this.matIndex++;
        // }
        ////////////////////////////   

        this.traverseGraph(this.idRoot, null, null, 0);
    }

    traverseGraph(currentNodeName, parentMaterialName, parentTextureInfo, depth) {
        // var depthStr = "";
        // for(var i = 0; i < depth; i++) { depthStr = depthStr.concat(' '); }
        // console.log(depthStr + currentNodeName);
        // depth++;
        
        var node = this.components.get(currentNodeName);

        if(!node)
        {
            this.materials.get(parentMaterialName).setTexture(this.textures.get(parentTextureInfo[0]));
            this.materials.get(parentMaterialName).apply();
            // this.materials[parentMaterialName].setTextureWrap();
            // this.primitives[currentNodeName].enableNormalViz();
            
            this.primitives[currentNodeName].updateTexCoords(parentTextureInfo[1], parentTextureInfo[2]);
            this.primitives[currentNodeName].display();
            return;
        }
 
        var thisMatIndex = this.matIndex % node.materials.length;
        var matName = (node.materials[thisMatIndex] != "inherit") ? 
                            node.materials[thisMatIndex] :
                            parentMaterialName;

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
        
        node.children.forEach(childName => {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.transformations.get(node.transformationref));
            this.traverseGraph(childName, matName, texInfo, depth);
            this.scene.popMatrix();
        });
    }
}