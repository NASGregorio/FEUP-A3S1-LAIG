/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCylinder extends CGFobject
{
    constructor(scene, base, top, height, slices, stacks)
    {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers()
    {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        var dTheta = 2 * Math.PI / this.slices;
        var currRadius = this.base;
        var currHeight = 0;
        var dHeight = this.height / this.stacks;

        for (var t = 0; t < this.stacks; t++)
        {
            var theta = 0;
            currRadius = this.base - t * (this.base - this.top) / this.stacks;
            currHeight = t * dHeight;

            for (var l = 0; l < this.slices; l++)
            {
                this.vertices.push( currRadius * Math.sin(theta),
                                    currRadius * Math.cos(theta),
                                    currHeight);

                var slope = -this.height/(this.base-this.top);
                var perpSlope = -1/slope;

                //console.log(perpSlope);

                this.normals.push(currRadius * Math.sin(theta), currRadius * Math.cos(theta), perpSlope);

                theta += dTheta;
            }
        }


        var v = 0;
        for (var k = 1; k <= this.slices * (this.stacks-1); k++) {
            if(k % this.slices == 0) {
                //console.log(v);
                this.indices.push(v, v + 1, v + 1 - this.slices);
                this.indices.push(v, v + this.slices, v + 1);
            }
            else {
                this.indices.push(v, v + 1 + this.slices, v + 1);
                this.indices.push(v, v + this.slices, v + 1 + this.slices);
            }
            v++;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    calcUVCoords()
    {
        var uvSlice = 1 / this.slices;
        for(var i = this.slices; i >= 0 ; i--)
        {
            this.texCoords.push(uvSlice*i, 1);
            this.texCoords.push(uvSlice*i, 0);
        }
        this.updateTexCoordsGLBuffers();
    }

    updateBuffers(slices) {
        this.slices = slices;
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}