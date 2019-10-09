/**
 *  torus centrado na origem, com raios interior e exterior variáveis (inner/outer radius) à volta do eixo Z
 * O torus deverá ter um número de “lados” (slices) variável à volta do raio interior, e um número de “voltas” (loops) à volta do eixo circular
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTorus extends CGFobject
{
    constructor(scene, inner, outer, slices, loops)
    {
        super(scene);
        this.slices = slices;
        this.loops = loops;
        this.inner = inner;
        this.outer = outer;
        this.initBuffers();
    }

    initBuffers()
    {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        var theta = 0;
        var thetaStep = 2 * Math.PI / this.slices;
        var alpha = 0;
        var alphaStep = 2 * Math.PI / this.loops;
        var cosAlpha = Math.cos(alpha);
        var sinAlpha = Math.sin(alpha);
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var cosAlphaNext;
        var sinAlphaNext;
        var cosThetaNext;
        var sinThetaNext;
        var counter = 0;


        //Outer loop
        for(var i = 0; i < this.loops; i++){

            cosAlphaNext = Math.cos(alpha + alphaStep);
            sinAlphaNext = Math.sin(alpha + alphaStep);

            //Inner loop
            for(var j = 0; j < this.slices; j++){

                cosThetaNext = Math.cos(theta + thetaStep);
                sinThetaNext = Math.sin(theta + thetaStep);

                this.vertices.push((this.outer + this.inner*cosTheta)*cosAlpha,(this.outer + this.inner*cosTheta)*sinAlpha,this.inner*sinTheta);

                var v = [   (this.outer + this.inner*cosTheta)*cosAlpha,
                            (this.outer + this.inner*cosTheta)*sinAlpha,
                            this.inner*sinTheta];


                var cx = this.outer*cosAlpha;
                var cy = this.outer*sinAlpha;
                var cz = 0;

                this.normals.push(v[0]-cx, v[1]-cy, v[2]-cz);

                theta = theta + thetaStep;
                cosTheta = Math.cos(theta);
                sinTheta = Math.sin(theta);
            }


            alpha = alpha + alphaStep;
            cosAlpha = Math.cos(alpha);
            sinAlpha = Math.sin(alpha);
        }

                    
        var v = 0;
        var lastIndex = this.slices * (this.loops - 1);

        for (var k = 1; k <= lastIndex; k++) {
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
        for (var k = 0; k < this.slices-1; k++) {
            this.indices.push(k, k + 1, k + 1 + lastIndex);
            this.indices.push(k, k + 1 + lastIndex, k + lastIndex);
        }
        this.indices.push(this.slices-1, 0, lastIndex+(this.slices-1));
        this.indices.push(0, lastIndex, lastIndex+(this.slices-1));

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    

    /*calcUVCoords(tileScaleVec)
    {
        var uvSlice = 1 / this.slices;
        for(var i = this.slices; i >= 0 ; i--)
        {
            this.texCoords.push(tileScaleVec[0] * uvSlice*i, tileScaleVec[1]);
            this.texCoords.push(tileScaleVec[0] * uvSlice*i, 0);
        }
        this.updateTexCoordsGLBuffers();
    }*/

    updateBuffers(slices) {
        this.slices = slices;
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}