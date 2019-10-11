class MyParser {
	// constructor() {
    // }
    createTransformationFromXML(transformation, sourceName) {
        var transfMatrix = mat4.create();
    
        for (var j = 0; j < transformation.length; j++) {
            switch (transformation[j].nodeName) {
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
}

