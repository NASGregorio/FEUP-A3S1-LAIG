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
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        //console.log("------------------START FRAME------------------");        
        this.traverseGraph(this.idRoot, this.idRoot, 0);
        
        //this.DEBUG_displayDemo();
        //this.DEBUG_displayF1();
        //console.log("------------------END   FRAME------------------");
    }

    traverseGraph(parentNodeName, currentNodeName, depth) {
        // var depthStr = "";
        // for(var i = 0; i < depth; i++) { depthStr = depthStr.concat(' '); }
        // console.log(depthStr + currentNodeName);
        // depth++;

        var matIndex = 0;

        var node = this.components[currentNodeName];

        if(!node)
        {
            // var thisMatIndex = matIndex % node.materials.length;

            // var matName = (node.materials[thisMatIndex] != "inherit") ? 
            //                 node.materials[thisMatIndex].apply() :
            //                 this.components[parentNodeName].materials[thisMatIndex];

            // this.materials[matName].apply();

            this.primitives[currentNodeName].display();
            return;
        }
        
        node.children.forEach(child => {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.transformations[node.transformationref]);
            this.traverseGraph(currentNodeName, child, depth);
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