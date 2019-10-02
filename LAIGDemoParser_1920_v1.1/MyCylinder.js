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

        // Definir passo do angulo em função do nº de faces
        var theta = 0;
        var thetaStep = 2 * Math.PI / this.slices;
        var radius = this.base;
        var heightStep = this.stacks

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var cosThetaNext, sinThetaNext;

        // Adicionar vértices iniciais
        this.vertices.push(cosTheta, 0, sinTheta);
        this.vertices.push(cosTheta, 1, sinTheta);

        // // Adicionar normais correspondentes
        // this.normals.push(cosTheta, 0, sinTheta);
        // this.normals.push(cosTheta, 0, sinTheta);

        // Gerar vertices, triangulos e normais segundo o nº de faces pedido
        for (var i = 0; i < this.slices-1; i++)
        {
            // Calculo do proximo angulo
            cosThetaNext = Math.cos(theta + thetaStep);
            sinThetaNext = Math.sin(theta + thetaStep);

            this.vertices.push(cosThetaNext, 0, sinThetaNext);
            this.vertices.push(cosThetaNext, 1, sinThetaNext);

            this.indices.push((2 * i), (2 * i + 1), (2 * i + 3));
            this.indices.push((2 * i), (2 * i + 3), (2 * i + 2));

            theta += thetaStep;
            cosTheta = cosThetaNext;
            sinTheta = sinThetaNext;

            // // Corresponde ao vetor aresta-origem
            // this.normals.push(cosTheta, 0, sinTheta);
            // this.normals.push(cosTheta, 0, sinTheta);
        }

        // Adicionar vertices finais (que coincidem com os iniciais)
        this.vertices.push(1, 0, 0);
        this.vertices.push(1, 1, 0);

        // Criar triângulos finais
        this.indices.push((this.slices-1)*2, (this.slices-1)*2+1, (this.slices-1)*2+3);
        this.indices.push((this.slices-1)*2, (this.slices-1)*2+3, (this.slices-1)*2+2);

        // // Adicionar normais dos vertices finais
        // this.normals.push(1, 0, 0);
        // this.normals.push(1, 0, 0);

        // Mapear coordenadas de textura em torno das faces (tileScaleVec controlo tiling)
        //this.calcUVCoords();

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