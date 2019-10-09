var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

var DEBUG_ALL = 0;
var DEBUG_FLAGS = [ 
    DEBUG_ALL | 0, //SCENE
    DEBUG_ALL | 0, //VIEWS
    DEBUG_ALL | 0, //AMBIENT
    DEBUG_ALL | 0, //LIGHTS
    DEBUG_ALL | 0, //TEXTURES
    DEBUG_ALL | 0, //MATERIALS
    DEBUG_ALL | 0, //TRANSFORMATIONS
    DEBUG_ALL | 0, //PRIMITIVES
    DEBUG_ALL | 0  //COMPONENTS
];

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.
        //this.treeStack = [];

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        console.log(this.components);
        //console.log(this.transformations);

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }
        if(DEBUG_ALL) console.log(nodes); //DEBUG

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            if(DEBUG_FLAGS[SCENE_INDEX]) console.log(nodes[index]); //DEBUG

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // var testasd;
        // if((testasd = this.processEntity("scene", nodeNames, nodes, SCENE_INDEX, this.parseScene, DEBUG_SCENE)) != null)
        //     return testasd;


        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            if(DEBUG_FLAGS[VIEWS_INDEX]) console.log(nodes[index]); //DEBUG

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <globals>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse globals block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            if(DEBUG_FLAGS[TRANSFORMATIONS_INDEX]) console.log(nodes[index]); //DEBUG

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            if(DEBUG_FLAGS[COMPONENTS_INDEX]) console.log(nodes[index]); //DEBUG

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

            this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
        this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        //this.referenceLength = axis_length || 1;
        this.referenceLength = axis_length != null ? axis_length : 1; //HACK

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        var children = viewsNode.children;

        var nodeNames = [];

        for (var i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
        }

        //this.onXMLMinorError("To do: Parse views and create cameras.");

        return null;
    }

    /**
     * Parses the <globals> node.
     * @param {globals block element} globalsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.globals = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed globals");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        this.onXMLMinorError("To do: Parse textures.");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            this.onXMLMinorError("To do: Parse materials.");
        }

        //this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        this.transformations = [];

        var transformationNodes = transformationsNode.children;
        var transformationDataNodes = [];

        // Any number of transformations.
        for (var i = 0; i < transformationNodes.length; i++) {

            if (transformationNodes[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(transformationNodes[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            // Get transformation data (translation, rotation and scaling nodes)            
            transformationDataNodes = transformationNodes[i].children;

            // Specifications for the current transformation.
            var transfMatrix = mat4.create();

            for (var j = 0; j < transformationDataNodes.length; j++) {
                switch (transformationDataNodes[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(transformationDataNodes[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':                        
                        var coordinates = this.parseCoordinates3D(transformationDataNodes[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        var rotation = this.parseRotation(transformationDataNodes[j], "rotate transformation for ID " + transformationID);
                        if (!Array.isArray(rotation.axis))
                            return rotation;

                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotation.angle, rotation.axis);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;

            //console.log(mat4.str(transfMatrix));
            // var t = mat4.transpose(transfMatrix, transfMatrix);
            // console.log("[" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + "]\n["
            //                 + t[4] + ", " + t[5] + ", " + t[6] + ", " + t[7] + "]\n["
            //                 + t[8] + ", " + t[9] + ", " + t[10] + ", " + t[11] + "]\n["
            //                 + t[12] + ", " + t[13] + ", " + t[14] + ", " + t[15] + "]");

            //pushmatrix
            //multMatrix(t)
            //display
            //popmatrix
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'cylinder') {
                // base radius
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base) && base > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // top radius
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top) && top > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.scene, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, radius, stacks, slices);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner > 0))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer > 0))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 2))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops > 2))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;


                var torus = new MyTorus(this.scene, inner, outer, slices, loops);

                this.primitives[primitiveId] = torus;
            }
            else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        this.components = new Map();
      
        var componentNodes = componentsNode.children;
        
        // Any number of components.
        console.log(componentNodes.length);
        for (var i = 0; i < componentNodes.length; i++) {
            
            var componentDataNodes = [];
            var componentData = [];
            var nodeNames = [];
            var component = {
                transformation: [],
                texture: "",
                materials: [],
                children: []
            };
            console.log(i);
            console.log(component);
            console.log("FORCEFUL EXIT, can't access second node");


            // Check for malformed components
            if (componentNodes[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(componentNodes[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            console.log(componentID);
            

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            
            // Get component data (transformations, materials, textures and children nodes)
            componentDataNodes = componentNodes[i].children;

            nodeNames = [];
            for (var j = 0; j < componentDataNodes.length; j++) {
                nodeNames.push(componentDataNodes[j].nodeName);
            }


            //TODO: Limpar array "component={}" para reutilizar entre diferentes componentes
            //this.components[componentID] = {};

            //for (var member in component) delete component[member];

            
            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            
            // Transformations
            componentData = componentDataNodes[transformationIndex].children;
            var transfMatrix = mat4.create();
            
            for (var j = 0; j < componentData.length; j++) {
                switch (componentData[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(componentData[j], "translate transformation from component " + componentID);
                        if (!Array.isArray(coordinates))
                        return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':                        
                        var coordinates = this.parseCoordinates3D(componentData[j], "scale transformation from component " + componentID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        var rotation = this.parseRotation(componentData[j], "rotate transformation from component " + componentID);
                        if (!Array.isArray(rotation.axis))
                            return rotation;

                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotation.angle, rotation.axis);
                        break;
                }
            }
            component.transformation = transfMatrix;
                    
            // TODO: Ver se referencias existem em todos os campos
            // Materials

            //component.materials = [];
            console.log(component.materials);
            componentData = componentDataNodes[materialsIndex].children;
            for (var k = 0; k < componentData.length; k++) {
                console.log("B");
                var materialID = this.reader.getString(componentData[k], 'id');
                component.materials.push(materialID);
            }
            console.log("C");
 
            // // Texture
            component.texture = this.reader.getString(componentDataNodes[textureIndex], 'id');
            
            // Children
            component.children = [];
            componentData = componentDataNodes[childrenIndex].children;
            for (var k = 0; k < componentData.length; k++) {
                var childID = this.reader.getString(componentData[k], 'id');
                component.children.push(childID);
            }

            // Assign newly created component to components array
            this.components.set(componentID, component);
            // this.components[componentID] = component;
            // this.components.length++;

            //console.log(component);
        }
    }
    

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the rotation from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseRotation(node, messageError) {
        var rotation = {};

        // axis
        var axis = this.reader.getString(node, 'axis');
        if (!(axis != null && axis.length == 1 && axis.match(/[x-z]/) ))
            return "unable to parse axis of the " + messageError;
        rotation.axis = [axis=="x", axis=="y", axis=="z"];

        // angle
        var angle = this.reader.getFloat(node, 'angle');
        if (!(angle != null && !isNaN(angle)))
            return "unable to parse angle of the " + messageError;
        rotation.angle = angle;

        return rotation;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    traverseGraph(currentNode, lastTransf) {
        currentNode.visited = true;
        this.scene.push();
        for (var i = 0; i < currentNode.children.length; i++) {
            if(!currentNode.children[i].visited)
                traverseGraph(currentNode.children[i], mat4.multMatrix(lastTransf, lastTransf, currentNode.transfMatrix))
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        //console.log(this.components);
        //console.log("------------------START FRAME------------------");
        // console.log(this.components);
        // console.log(this.components.length);
        // for (var i = 0; i < this.components.length; i++) {
        //     console.log(i + ": " + this.components[i]);
        //     this.components[i].visited = false;
        //     //console.log(this.components[i].visited);
        // }
        
        // this.components.forEach((value, key) => {
        //     console.log(key);
        //     value.visited = false;
        // });

        // this.treeStack = [];
        // console.log(this.treeStack);
        // this.treeStack.push(this.idRoot);
        // console.log(this.idRoot);

        // while (this.treeStack.length > 0) {
        //     var nodeName = this.treeStack.pop();
        //     //console.log(nodeName);
        //     var node = this.components.get(nodeName);
        //     //console.log(""+node.texture);
        //     if(node && !node.visited) {
        //         console.log(node);
        //         node.visited = true;
        //         node.children.forEach(element => {
        //             if(!element.visited)
        //                 this.treeStack.push(element);
        //         });
        //     }
        // }
        
        //var root = this.components[this.idRoot];
        //var lastTransf = root.transfMatrix;
        
        // this.traverseGraph(this.components[this.idRoot], 
        //                 [1,0,0,0,
        //                 0,1,0,0,
        //                 0,0,1,0,
        //                 0,0,0,1]);
        
        // console.log(this.components[this.idRoot]);
        // console.log(this.components[this.idRoot].children);
        
        //To test the parsing/creation of the primitives, call the display function directly
        //this.primitives['demoRectangle'].display();
        this.primitives['demoCylinder'].enableNormalViz();
        //this.primitives['demoSphere'].display();
        this.primitives['demoCylinder'].display();
        //console.log("------------------END   FRAME------------------");
    }


    /**
     * Process node (check validity and order)
     * @param {*} nodeName 
     * @param {*} nodeNames 
     * @param {*} nodes 
     * @param {*} expectedIndex 
     * @callback parseFunc
            console.log(this.components.length);
     */
    processEntity(nodeName, nodeNames, nodes, expectedIndex, parseFunc) {
        var index = -1;

        if ((index = nodeNames.indexOf(nodeName)) == -1)
            return "tag <"+nodeName+"> missing";
        else {
            if (index != expectedIndex)
                this.onXMLMinorError("tag <"+nodeName+"> out of order " + index);

            if(DEBUG_FLAGS[expectedIndex]) console.log(nodes[index]); //DEBUG

            //Parse scene block
            return parseFunc(nodes[index]);
        }
    }
}