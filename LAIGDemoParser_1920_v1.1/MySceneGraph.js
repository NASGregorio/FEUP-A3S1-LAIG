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


        this.count++;
        
        if(this.count >= 60) {
            this.count = 0;
            this.matIndex++;
        }

        //console.log("------------------START FRAME------------------");        
        this.traverseGraph(this.idRoot, this.idRoot, 0);
        
        //this.DEBUG_displayDemo();
        //this.DEBUG_displayF1();
        //console.log("------------------END   FRAME------------------");
    }

    traverseGraph(currentNodeName, parentMaterialName, parentTextureName, depth) {
        // var depthStr = "";
        // for(var i = 0; i < depth; i++) { depthStr = depthStr.concat(' '); }
        // console.log(depthStr + currentNodeName);
        // depth++;

        
        var node = this.components[currentNodeName];

        if(!node)
        {
            this.materials[parentMaterialName].setTexture(this.textures[parentTextureName]);
            //this.materials[parentMaterialName].setTextureWrap();
            this.materials[parentMaterialName].apply();
            this.primitives[currentNodeName].display();
            return;
        }
 
        var thisMatIndex = this.matIndex % node.materials.length;
        var matName = (node.materials[thisMatIndex] != "inherit") ? 
                            node.materials[thisMatIndex] :
                            parentMaterialName;

        var texName;
        switch (node.texture) {
            case "inherit":
                texName = parentTextureName;
                break;
            case "none":
                texName = null;
                break;
            default:
                texName = node.texture;
                break;
        }
        
        node.children.forEach(childName => {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.transformations[node.transformationref]);
            this.traverseGraph(childName, matName, texName, depth);
            this.scene.popMatrix();
        });
    }

    DEBUG_displayDemo() {
        this.scene.pushMatrix();
            this.scene.translate(0,0,0);
            this.primitives['demoSphere'].display();
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
            this.scene.translate(2,-2,0);
            //this.primitives['demoCylinder'].enableNormalViz();
            this.primitives['demoCylinder'].display();
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
            this.scene.translate(2,2,0);
            this.scene.scale(1/2,1/2,1/2);
            //this.primitives['demoTorus'].enableNormalViz();
            this.primitives['demoTorus'].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(4,-2,0);
            //this.primitives['demoRectangle'].enableNormalViz();
            this.primitives['demoRectangle'].display();
        this.scene.popMatrix();
        
        // this.scene.pushMatrix();
        //     this.scene.translate(4,2,0);
        //     //this.primitives['demoTriangle'].enableNormalViz();
        //     this.primitives['demoTriangle'].display();
        // this.scene.popMatrix();
    }

    DEBUG_displayF1(){
        this.scene.pushMatrix();
            this.scene.translate(0,0,0);
            this.primitives['f1_car_splitter'].display();
        this.scene.popMatrix();
    
        this.scene.pushMatrix();
            this.scene.translate(2,-2,0);
            this.scene.scale(0.5,0.5,0.25);
            //this.primitives['demoCylinder'].enableNormalViz();
            this.primitives['f1_car_body_cylinder'].display();
        this.scene.popMatrix();
    
        this.scene.pushMatrix();
            this.scene.translate(2,2,0);
            //this.primitives['demoTorus'].enableNormalViz();
            this.primitives['f1_car_tire_f_torus'].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(4,-2,0);
            //this.primitives['demoRectangle'].enableNormalViz();
            this.primitives['f1_car_wheel_rim_rect'].display();
        this.scene.popMatrix();
    }
}