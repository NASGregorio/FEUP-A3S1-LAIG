var DEGREE_TO_RAD = Math.PI / 180;
var RAD_TO_DEGREE = 180 / Math.PI;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
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
    DEBUG_ALL | 0, //GLOBALS
    DEBUG_ALL | 0, //LIGHTS
    DEBUG_ALL | 0, //TEXTURES
    DEBUG_ALL | 0, //MATERIALS
    DEBUG_ALL | 0, //TRANSFORMATIONS
    DEBUG_ALL | 0, //PRIMITIVES
    DEBUG_ALL | 0  //COMPONENTS
];

/**
 * MyParser class, responsible for parsing XML scene data.
 */
class MyParser {

    /**
     * @constructor
     */
	constructor(sceneGraph, filename) {

        this.sceneGraph = sceneGraph;

        this.loadedOk = null;

        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {

        // Check root tag
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        // Get all nodes
        var nodes = rootElement.children;

        // Get all node names
        var nodeNames = [];
        for (var i = 0; i < nodes.length; i++)
            nodeNames.push(nodes[i].nodeName);
   
        // Process each node, checking for errors.
        var error;

        // <scene>
        if((error = this.processEntity("scene", nodeNames, nodes, SCENE_INDEX, this.parseScene.bind(this))) != null)
            return error;

        // <views>
        if((error = this.processEntity("views", nodeNames, nodes, VIEWS_INDEX, this.parseView.bind(this))) != null)
            return error;

        // <globals>
        if((error = this.processEntity("globals", nodeNames, nodes, GLOBALS_INDEX, this.parseGlobals.bind(this))) != null)
            return error;

        // <lights>
        if((error = this.processEntity("lights", nodeNames, nodes, LIGHTS_INDEX, this.parseLights.bind(this))) != null)
            return error;

        // <textures>
        if((error = this.processEntity("textures", nodeNames, nodes, TEXTURES_INDEX, this.parseTextures.bind(this))) != null)
            return error;

        // <materials>
        if((error = this.processEntity("materials", nodeNames, nodes, MATERIALS_INDEX, this.parseMaterials.bind(this))) != null)
            return error;

        // <transformations>
        if((error = this.processEntity("transformations", nodeNames, nodes, TRANSFORMATIONS_INDEX, this.parseTransformations.bind(this))) != null)
            return error;

        // <primitives>
        if((error = this.processEntity("primitives", nodeNames, nodes, PRIMITIVES_INDEX, this.parsePrimitives.bind(this))) != null)
            return error;

        // <components>
        if((error = this.processEntity("components", nodeNames, nodes, COMPONENTS_INDEX, this.parseComponents.bind(this))) != null)
            return error;

        this.log("READY");
        return null;
    }

    /**
     * Process node (check validity and order)
     * @param {node tag} nodeName 
     * @param {array of existing node tags} nodeNames 
     * @param {array of existing nodes} nodes 
     * @param {expected position of node} expectedIndex 
     * @callback parseFunc
     */
    processEntity(nodeName, nodeNames, nodes, expectedIndex, parseFunc) {
        var index = -1;

        if ((index = nodeNames.indexOf(nodeName)) == -1)
            return "tag <"+nodeName+"> missing";
        else {
            if (index != expectedIndex)
                this.onXMLMinorError("tag <"+nodeName+"> out of order " + index);

            // DEBUG
            if(DEBUG_FLAGS[expectedIndex])
                console.log(nodes[index]);

            //Parse scene block
            var res = parseFunc(nodes[index]);

            // DEBUG
            if(DEBUG_FLAGS[expectedIndex] && res == null)
                this.log("Parsed "+ nodeName);

            return res;
        }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
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

        this.loadedOk = true;

        // DEBUG
        if(DEBUG_FLAGS[SCENE_INDEX])            console.log("Scene: ", this.sceneGraph.idRoot, this.sceneGraph.referenceLength);
        if(DEBUG_FLAGS[VIEWS_INDEX])            console.log("Views: ", this.sceneGraph.views);
        if(DEBUG_FLAGS[GLOBALS_INDEX])          console.log("Globals: ", this.sceneGraph.ambient, this.sceneGraph.background);
        if(DEBUG_FLAGS[LIGHTS_INDEX])           console.log("Lights: ", this.sceneGraph.lights);
        if(DEBUG_FLAGS[TEXTURES_INDEX])         console.log("Textures: ", this.sceneGraph.textures);
        if(DEBUG_FLAGS[MATERIALS_INDEX])        console.log("Materials: ", this.sceneGraph.materials);
        if(DEBUG_FLAGS[TRANSFORMATIONS_INDEX])  console.log("Transformations: ", this.sceneGraph.transformations);
        if(DEBUG_FLAGS[PRIMITIVES_INDEX])       console.log("Primitives: ", this.sceneGraph.primitives);
        if(DEBUG_FLAGS[COMPONENTS_INDEX])       console.log("Components: ", this.sceneGraph.components);

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.sceneGraph.scene.onGraphLoaded();
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.sceneGraph.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.axis_length = axis_length;
        this.sceneGraph.referenceLength = axis_length;

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        // Get default view ID.
        var defaultView = this.reader.getString(viewsNode, 'default');
        if (defaultView == null)
            return "no default view defined for scene";
        this.sceneGraph.defaultView = defaultView;
        
        this.sceneGraph.views = new Map();

        var viewNodes = viewsNode.children;
        var viewDataNodes;
        var nodeNames;

        // Any number of cameras.
        for (var i = 0; i < viewNodes.length; i++) {
            
            //Check type of view
            var viewType = viewNodes[i].nodeName;
            if (viewType != "perspective" && viewType != "ortho") {
                this.onXMLMinorError("unknown tag <" + viewType + ">");
                continue;
            }

            // Get id of the current view.
            var viewID = this.reader.getString(viewNodes[i], 'id');
            if (viewID == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.sceneGraph.views.has(viewID))
                return "ID must be unique for each view (conflict: ID = " + viewID + ")";

            // Get near plane of the current view.
            var nearPlane = this.reader.getFloat(viewNodes[i], 'near');
            if (nearPlane == null)
                return "no ID defined for near";
            if (nearPlane < 0)
                return "Near plane from view " + viewID + " must have a positive value";

            // Get far plane of the current view.
            var farPlane = this.reader.getFloat(viewNodes[i], 'far');
            if (farPlane == null)
                return "no ID defined for far";
            if (farPlane < nearPlane)
                return "Far plane from view " + viewID + " must have a bigger value than near plane";

            nodeNames = [];
            viewDataNodes = viewNodes[i].children;
            for (var j = 0; j < viewDataNodes.length; j++)
                nodeNames.push(viewDataNodes[j].nodeName);

            var fromIndex = nodeNames.indexOf("from");
            var toIndex = nodeNames.indexOf("to");
            var upIndex = nodeNames.indexOf("up");


            if(viewDataNodes[fromIndex] == null)
                return "View " + viewID + " is missing \"from\" tag";
            var position = this.parseCoordinates3D(viewDataNodes[fromIndex], '\"from\" tag in view ' + viewID);
            if (!Array.isArray(position))
                return position;

            if(viewDataNodes[toIndex] == null)
                return "View " + viewID + " is missing \"to\" tag";
            var target = this.parseCoordinates3D(viewDataNodes[toIndex], '\"to\" tag in view ' + viewID);
            if (!Array.isArray(target))
                return target;

            var view;
            switch (viewType) {
                case "perspective":
                    var fov = this.reader.getFloat(viewNodes[i], 'angle');
                    if (fov == null)
                        return "no ID defined for fov";
                    if (fov < 0 || fov > 360)
                        return "Field of view (" + viewID + ") must be between 0 and 360 degrees";

                    view = new CGFcamera(fov * DEGREE_TO_RAD, nearPlane, farPlane, vec3.clone(position), vec3.clone(target));
                    break;
            
                case "ortho":
                    var leftBound = this.reader.getFloat(viewNodes[i], 'left');
                    if (leftBound == null)
                        return "no ID defined for left bound";
                    var rightBound = this.reader.getFloat(viewNodes[i], 'right');
                    if (rightBound == null)
                        return "no ID defined for right bound";
                    if (rightBound < leftBound)
                        return "Right bound from view " + viewID + " must be bigger than left bound";
                    var topBound = this.reader.getFloat(viewNodes[i], 'top');
                    if (topBound == null)
                        return "no ID defined for top bound";
                    var bottomBound = this.reader.getFloat(viewNodes[i], 'bottom');
                    if (bottomBound == null)
                        return "no ID defined for bottom bound";
                    if (bottomBound > topBound)
                        return "Bottom bound from view " + viewID + " must be bigger than top bound";
                    if(viewDataNodes[upIndex] == null)
                        return "View " + viewID + " is missing \"up\" tag";
                    var upVector = this.parseCoordinates3D(viewDataNodes[upIndex], '\"up\" tag in view ' + viewID);
                    if (!Array.isArray(upVector))
                        return upVector;

                    view = new CGFcameraOrtho(leftBound, rightBound, bottomBound, topBound,
                                nearPlane, farPlane, vec3.clone(position), vec3.clone(target), vec3.clone(upVector));
                    break;

                default:
                    return "Can't reach."
            }

            this.sceneGraph.views.set(viewID, view);
        }

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <globals> node.
     * @param {globals block element} globalsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        this.sceneGraph.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        this.sceneGraph.background = color;

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {

        this.sceneGraph.lights = new Map();

        var children = lightsNode.children;

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
            if (this.sceneGraph.lights.has(lightId))
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = this.reader.getFloat(children[i], 'enabled');
            if (!(enableLight != null && !isNaN(enableLight) && (enableLight == 0 || enableLight == 1))){
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                enableLight = 1;
            }

            //Add enabled boolean and type name to light info
            global.push(numLights);
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

            var attenuationNode = nodeNames.indexOf("attenuation");
            if(attenuationNode == null)
                return "Light " + lightId + " is missing \"attenuation\" tag.";

            var constantAtt = this.reader.getFloat(grandChildren[attenuationNode], 'constant');
            if (constantAtt == null || isNaN(constantAtt) || constantAtt < 0 || constantAtt > 1)
                return "Light " + lightId + " has invalid constant attenuation value.";
            var linearAtt = this.reader.getFloat(grandChildren[attenuationNode], 'linear');
            if (linearAtt == null || isNaN(linearAtt) || linearAtt < 0 || linearAtt > 1)
                return "Light " + lightId + " has invalid linear attenuation value.";
            var quadraticAtt = this.reader.getFloat(grandChildren[attenuationNode], 'quadratic');
            if (quadraticAtt == null || isNaN(quadraticAtt) || quadraticAtt < 0 || quadraticAtt > 1)
                return "Light " + lightId + " has invalid quadratic attenuation value.";

            global.push(constantAtt, linearAtt, quadraticAtt);

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

                global.push(...[angle, exponent, targetLight]);
            }

            if(numLights <= 8)
                this.sceneGraph.lights.set(lightId, global);
                
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.sceneGraph.textures = new Map();

        var textureNodes = texturesNode.children;

        if(textureNodes.length == 0) {
            return "Must declare at least one texture."
        }

        // Any number of materials.
        for (var i = 0; i < textureNodes.length; i++) {

            if (textureNodes[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + textureNodes[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var textureID = this.reader.getString(textureNodes[i], 'id');
            if (textureID == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.sceneGraph.textures.has(textureID))
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";

            // Get file name of the current texture.
            var textureFile = this.reader.getString(textureNodes[i], 'file');
            if (textureFile == null)
                return "no file defined for texture " + textureID;

            var valid = /^.*\.(jpg|png)$/i.test(textureFile);
            if(!valid)
                return "Texture file must have a .jpg or .png extention";

            var texture = new CGFtexture(this.sceneGraph.scene, textureFile);
            if(texture != null)
                this.sceneGraph.textures.set(textureID, texture);
            else
                return "Failed to load texture " + textureID + " with file " + textureFile;
        }

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        this.sceneGraph.materials = new Map();

        var materialNodes = materialsNode.children;
        var materialDataNodes = [];

        if(materialNodes.length == 0) {
            return "Must declare at least one material."
        }

        // Any number of materials.
        for (var i = 0; i < materialNodes.length; i++) {

            if (materialNodes[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + materialNodes[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(materialNodes[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.sceneGraph.materials.has(materialID))
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            // Get shininess of the current material.
            var materialShine = this.reader.getString(materialNodes[i], 'shininess');
            if (materialShine == null)
                return "no shininess defined for material " + materialID;

            // Get transformation data (translation, rotation and scaling nodes)            
            materialDataNodes = materialNodes[i].children;

            // Specifications for the current transformation.
            var mat = this.processMaterial(materialID, materialShine, materialDataNodes);
            if (!(mat instanceof CGFappearance))
                return mat;
            else
                this.sceneGraph.materials.set(materialID, mat);
        }

        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        this.sceneGraph.transformations = new Map();

        var transformationNodes = transformationsNode.children;
        var transformationDataNodes = [];

        if(transformationNodes.length == 0) {
            return "Must declare at least one transformation."
        }

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
            if (this.sceneGraph.transformations.has(transformationID))
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            // Get transformation data (translation, rotation and scaling nodes)            
            transformationDataNodes = transformationNodes[i].children;

            // Specifications for the current transformation.
            var transfMatrix = this.processTransformation(transformationDataNodes, transformationID);
            if (!(transfMatrix instanceof Float32Array))
                return transfMatrix;

            this.sceneGraph.transformations.set(transformationID, transfMatrix);
        }
        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        this.sceneGraph.primitives = [];

        var primitiveNodes = primitivesNode.children;
        var primitiveDataNodes = [];

        if(primitiveNodes.length == 0) {
            return "Must declare at least one primitive."
        }

        // Any number of primitives.
        for (var i = 0; i < primitiveNodes.length; i++) {

            if (primitiveNodes[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(primitiveNodes[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.sceneGraph.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            primitiveDataNodes = primitiveNodes[i].children;

            // Validate the primitive type
            if (primitiveDataNodes.length != 1 ||
                (primitiveDataNodes[0].nodeName != 'rectangle' && primitiveDataNodes[0].nodeName != 'triangle' &&
                 primitiveDataNodes[0].nodeName != 'cylinder' && primitiveDataNodes[0].nodeName != 'sphere' &&
                 primitiveDataNodes[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = primitiveDataNodes[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(primitiveDataNodes[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(primitiveDataNodes[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(primitiveDataNodes[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(primitiveDataNodes[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.sceneGraph.scene, primitiveId, x1, x2, y1, y2);

                this.sceneGraph.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') {
                // x1
                var x1 = this.reader.getFloat(primitiveDataNodes[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(primitiveDataNodes[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // z1
                var z1 = this.reader.getFloat(primitiveDataNodes[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(primitiveDataNodes[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(primitiveDataNodes[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z2 = this.reader.getFloat(primitiveDataNodes[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // x3
                var x3 = this.reader.getFloat(primitiveDataNodes[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(primitiveDataNodes[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z3
                var z3 = this.reader.getFloat(primitiveDataNodes[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyTriangle(this.sceneGraph.scene, x1, x2, x3, y1, y2, y3, z1, z2, z3);

                this.sceneGraph.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'cylinder') {
                // base radius
                var base = this.reader.getFloat(primitiveDataNodes[0], 'base');
                if (!(base != null && !isNaN(base) && base > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // top radius
                var top = this.reader.getFloat(primitiveDataNodes[0], 'top');
                if (!(top != null && !isNaN(top) && top >= 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(primitiveDataNodes[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(primitiveDataNodes[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(primitiveDataNodes[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.sceneGraph.scene, base, top, height, slices, stacks);

                this.sceneGraph.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(primitiveDataNodes[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(primitiveDataNodes[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 0))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(primitiveDataNodes[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.sceneGraph.scene, radius, stacks, slices);

                this.sceneGraph.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                // inner
                var inner = this.reader.getFloat(primitiveDataNodes[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner > 0))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(primitiveDataNodes[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer > 0))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(primitiveDataNodes[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices > 1))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(primitiveDataNodes[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops > 2))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;


                var torus = new MyTorus(this.sceneGraph.scene, inner, outer, slices, loops);

                this.sceneGraph.primitives[primitiveId] = torus;
            }
            else {
                console.warn("To do: Parse other primitives.");
            }
        }
        return null;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        this.sceneGraph.components = new Map();

        var componentNodes = componentsNode.children;

        if(componentNodes.length == 0) {
            return "Must declare at least one component."
        }

        // var missingNodes = [];

        for (var i = 0; i < componentNodes.length; i++) {
            
            var componentDataNodes = [];
            var componentData = [];
            var nodeNames = [];
            var component = {
                transformationref: "",
                texture: [],
                materials: [],
                componentRefs: [],
                primitiveRefs: [],
            };

            // Check for malformed components
            if (componentNodes[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + componentNodes[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(componentNodes[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.sceneGraph.components.has(componentID))
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            
            // Get component data (transformations, materials, textures and children nodes)
            componentDataNodes = componentNodes[i].children;

            nodeNames = [];
            for (var j = 0; j < componentDataNodes.length; j++) {
                nodeNames.push(componentDataNodes[j].nodeName);
            }
            
            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            
            // Transformations
            if(componentDataNodes[transformationIndex] == null)
                return "Component " + componentID + " is missing transformation tag";
            componentData = componentDataNodes[transformationIndex].children;
            var ref;
            
            // has nothing
            if(componentData.length == 0) {
                if(!this.sceneGraph.transformations.has("canonical"))
                    this.sceneGraph.transformations.set("canonical", mat4.create());
                ref = "canonical";
            }
            // has ref
            else if (componentData.length == 1 && componentData[0].nodeName == "transformationref") {
                ref = this.reader.getString(componentData[0], 'id');
                if(ref == null)
                    return "Component " + componentID + " has transformationref without id.";
                if(!this.sceneGraph.transformations.has(ref))
                    return "Component " + componentID + " wants transformation with id " + ref + " that doesn't exist.";
            } 
            // has explicit
            else {
                var transfMatrix = this.processTransformation(componentData, componentID);
                if (!(transfMatrix instanceof Float32Array))
                return transfMatrix;
                
                this.sceneGraph.transformations.set(componentID, transfMatrix);
                ref = componentID;
                    
            }
            component.transformationref = ref;

            // Materials
            if(componentDataNodes[materialsIndex] == null)
                return "Component " + componentID + " is missing materials tag";
            componentData = componentDataNodes[materialsIndex].children;

            for (var k = 0; k < componentData.length; k++) {
                var materialID = this.reader.getString(componentData[k], 'id');
                if(materialID != "inherit" && !this.sceneGraph.materials.has(materialID))
                    this.onXMLMinorError("Component " + componentID + " has non-existent material " + materialID);
                else
                    component.materials.push(materialID);
            }

            if(component.materials.length == 0)
                return "Component " + componentID + " needs to have at least one material.";

            // Texture
            if(componentDataNodes[textureIndex] == null)
                return "Component " + componentID + " is missing texture tag";
            var textureFile = this.reader.getString(componentDataNodes[textureIndex], 'id');

            var hasTexture = /^(?!.*(inherit|none))/.test(textureFile);
            if(!hasTexture || this.sceneGraph.textures.has(textureFile))
                component.texture.push(textureFile);
            else
                return "Component " + componentID + " has non-existent texture " + textureFile;

            if(hasTexture) {
                var length_s = this.reader.getFloat(componentDataNodes[textureIndex], 'length_s')
                if (!(length_s != null && !isNaN(length_s)))
                    return "unable to parse length_s of the texture from component " + componentID;
                var length_t = this.reader.getFloat(componentDataNodes[textureIndex], 'length_t')
                if (!(length_t != null && !isNaN(length_t)))
                    return "unable to parse length_t of the texture from component " + componentID;

                component.texture.push(length_s, length_t);
            }

            // Children
            if(componentDataNodes[childrenIndex] == null)
                return "Component " + componentID + " is missing children tag";

            componentData = componentDataNodes[childrenIndex].children;

            if(componentData.length == 0)
                return "Component " + componentID + " must have at least one child.";

            for (var k = 0; k < componentData.length; k++) {

                var childID = this.reader.getString(componentData[k], 'id');
                if(childID == null)
                    return "Component " + componentID + " has componentref without id.";

                var nodeName = componentData[k].nodeName;

                switch (nodeName) {
                    case "componentref":
                        component.componentRefs.push(childID);                        
                        break;
                    case "primitiveref":
                        component.primitiveRefs.push(childID);   
                        break;                                                                 
                    default:
                        return "unknown tag <" + nodeName + ">";
                }
            }

            // Assign newly created component to components array
            this.sceneGraph.components.set(componentID, component);
        }

        if(!this.sceneGraph.components.has(this.sceneGraph.idRoot)) {
            return "Scene is missing root node \"" + this.sceneGraph.idRoot + "\"";
        }

        var valid = true; //TODO
        this.sceneGraph.components.forEach((value, key) => {
            //console.log(key);
            for (var i = 0; i < value.componentRefs.length; i++) {
                //console.log(value.componentRefs[i]);
                if(!this.sceneGraph.components.has(value.componentRefs[i])) {
                    this.onXMLError("Component " + key + " wants child with id " + value.componentRefs[i] + " that doesn't exist.");
                    valid = false;
                    break;
                }
            }
        });
        
        if(valid)
            return null;
        else
            return "Missing components.";

    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        var rotation = [];

        // axis
        var axis = this.reader.getString(node, 'axis');
        if (!(axis != null && axis.length == 1 && axis.match(/[x-z]/) ))
            return "unable to parse axis of the " + messageError;

        rotation.axis = [axis=="x", axis=="y", axis=="z"];

        // angle
        var angle = this.reader.getFloat(node, 'angle');
        if (!(angle != null && !isNaN(angle)))
            return "unable to parse angle of the " + messageError;

        rotation.angle = angle * DEGREE_TO_RAD;

        return rotation;
    }

    /**
     * Process content from a <transformation> XML block into a transformation object
     * @param {transformation block element} transformation
     * @param {block ID to be displayed in case of error} sourceName
     */
    processTransformation(transformation, sourceName) {
        var transfMatrix = mat4.create();
    
        for (var j = 0; j < transformation.length; j++) {
            switch (transformation[j].nodeName) {
                case 'transformationref':
                    return ("transformation can't contain both transformationref and explicit transformations: " + sourceName);
                case 'translate':
                    var coordinates = this.parseCoordinates3D(transformation[j], "translate transformation from " + sourceName);
                    if (!Array.isArray(coordinates))
                        return coordinates;
    
                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'scale':                        
                    var coordinates = this.parseCoordinates3D(transformation[j], "scale transformation from " + sourceName);
                    if (!Array.isArray(coordinates))
                        return coordinates;
    
                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'rotate':
                    var rotation = this.parseRotation(transformation[j], "rotate transformation from " + sourceName);
                    if (!Array.isArray(rotation.axis))
                        return rotation;
    
                    transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotation.angle, rotation.axis);
                    break;
            }
        }
        return transfMatrix;
    }

    /**
     * Process content from a <material> XML block into a material object
     * @param {material block element} material
     * @param {block ID to be displayed in case of error} sourceName
     */
    processMaterial(sourceName, shininess, material) {

        if(material.length != 4)
            return "material only has 4 attributes. " + sourceName + " has " + material.length;
            
        var got_emission = false;
        var got_ambient = false;
        var got_diffuse = false;
        var got_specular = false;
        
        var emission = [];
        var ambient = [];
        var diffuse = [];
        var specular = [];
            
        for (var j = 0; j < material.length; j++) {
            switch (material[j].nodeName) {
                case 'emission':
                    if(got_emission)
                        return "duplicate emission attribute found in " + sourceName;
                    got_emission = true;
                    
                    emission = this.parseColor(material[j], "material with ID " + sourceName);
                    if (!Array.isArray(emission))
                        return emission;
                    break;
                case 'ambient':
                    if(got_ambient)
                        return "duplicate ambient attribute found in " + sourceName;
                    got_ambient = true;

                    ambient = this.parseColor(material[j], "material with ID " + sourceName);
                    if (!Array.isArray(ambient))
                        return ambient;
                    break;
                case 'diffuse':                        
                    if(got_diffuse)
                        return "duplicate diffuse attribute found in " + sourceName;
                    got_diffuse = true;
                        
                    diffuse = this.parseColor(material[j], "material with ID " + sourceName);
                    if (!Array.isArray(diffuse))
                        return diffuse;
                    break;
                case 'specular':
                    if(got_specular)
                        return "duplicate specular attribute found in " + sourceName;
                    got_specular = true;
                        
                    specular = this.parseColor(material[j], "material with ID " + sourceName);
                    if (!Array.isArray(specular))
                        return specular;
                    break;
                default:
                    return "invalid material attribute tag \"" + material[j].nodeName +"\" in " + sourceName;
            }
        }

        if(got_emission && got_ambient && got_diffuse && got_specular) {
            var mat = new CGFappearance(this.sceneGraph.scene);
            mat.setShininess(shininess);
            mat.setEmission(emission[0], emission[1], emission[2], emission[3]);
            mat.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
            mat.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
            mat.setSpecular(specular[0], specular[1], specular[2], specular[3]);
            return mat;
        } else {
            return "Missing attributes: " + sourceName;
        }
    }

}