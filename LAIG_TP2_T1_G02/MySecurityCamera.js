/**
 * MySecurityCamera
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MySecurityCamera extends CGFobject
{
    constructor(scene, rtt)
    {
        super(scene);

        this.scene = scene;
        this.rtt = rtt;

        this.rect = new MyRectangle(scene, "security camera",
            this.scene.gl.canvas.width * 0.75,
            this.scene.gl.canvas.width,
            this.scene.gl.canvas.height * 0.75,
            this.scene.gl.canvas.height,
        );

        this.screenUI = new CGFshader(this.scene.gl, "shaders/texture1.vert", "shaders/texture1.frag"),

        this.mat = new CGFappearance(this.scene);
        this.mat.setShininess(10);
        this.mat.setEmission(0, 0, 0);
        this.mat.setAmbient(1, 1, 1);
        this.mat.setDiffuse(1, 1, 1);
        this.mat.setSpecular(0, 0, 0);

        this.mat.setTexture(this.rtt);
    }

    display() {
        this.scene.setActiveShader(this.screenUI);
        this.scene.pushMatrix();
        this.mat.apply();
        this.rect.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}