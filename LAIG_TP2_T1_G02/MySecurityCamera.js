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
            0.5,
            1,
            -1,
            -0.5
        );

        this.screenUI = new CGFshader(this.scene.gl, "shaders/texture1.vert", "shaders/texture1.frag");

    }
    
    display() {
        this.scene.setActiveShader(this.screenUI);
        this.scene.pushMatrix();
        this.rtt.bind(0);
        this.rect.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}