/**
 * MaterialObj class, responsible for parsing XML scene data.
 */
class MaterialObj {

    /**
     * @constructor
     */
	constructor(id, shininess, emission, ambient, diffuse, specular) {

        this.id = id;
        this.shininess = shininess;
        this.emission = emission;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}