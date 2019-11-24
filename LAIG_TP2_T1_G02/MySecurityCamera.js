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

        this.screenUI.setUniformsValues({resolution: [this.scene.gl.canvas.width/4,this.scene.gl.canvas.height/4]});
        this.screenUI.setUniformsValues({unit_origin: [3.5,0.5]});
        this.screenUI.setUniformsValues({uSampler2: 1});
    }
    
    display() {
        this.scene.setActiveShader(this.screenUI);
        this.screenUI.setUniformsValues({line_thickness: this.scene.line_thickness});
        this.screenUI.setUniformsValues({line_count: this.scene.line_count});
        this.screenUI.setUniformsValues({line_speed: this.scene.line_speed});

        this.screenUI.setUniformsValues({noise_strength: this.scene.noise_strength});

        this.screenUI.setUniformsValues({darkness_factor: this.scene.darkness_factor});

        this.screenUI.setUniformsValues({outer_radius: this.scene.outer_radius});
        this.screenUI.setUniformsValues({inner_radius: this.scene.inner_radius});
        this.screenUI.setUniformsValues({strength_factor: this.scene.strength_factor});

        this.screenUI.setUniformsValues({time: this.scene.time / 100 % 1000});

        this.scene.noiseTex.bind(1);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_WRAP_S, this.scene.gl.REPEAT);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_WRAP_T, this.scene.gl.REPEAT);
        
        this.rtt.bind(0);
        this.scene.pushMatrix();
        this.rect.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}