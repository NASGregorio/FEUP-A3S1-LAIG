/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {

        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.curr_folder = null;
        
        this.quit = PrologInterpreter.send_quit;
        
        this.show_start_options(this.scene);

        this.initKeys();
        
        return true;
    }

    clean_folder() {
        if(this.curr_folder != null)
            this.gui.removeFolder(this.curr_folder);
    }

    add_quit_button(group) {
        group.add(this, 'quit').name("Quit Game.");
    }

    show_start_options(ctx) {

        this.clean_folder();

        let group = this.gui.addFolder("Start Menu");
        group.open();
      
        group.add(ctx, "start_game").name("Start Game!");
        group.add(ctx, "how_to_play").name("How to play?");
        this.add_quit_button(group);

        this.curr_folder = group;
    }

    show_turn_information(ctx) {

        this.clean_folder();

        let group = this.gui.addFolder("Turn Information");
        group.open();
      
        group.add(ctx, "do_stuff").name("Do Stuff!");
        this.add_quit_button(group);

        this.curr_folder = group;
    }

    update_info_panel(player, time, info , error) {
        if( player != "" ) document.getElementById("player").innerText = "Player: " + player;
        if( time != "" ) document.getElementById("time").innerText = "\nTime: " + time;
        if( info != "" ) document.getElementById("information").innerText = "\nInformation: " + info;
        if( error != "" ) document.getElementById("error").innerText = "\nError: " + error;
    }

    addViews() {
        this.gui.add(this.scene, 'selectedView', this.scene.viewNamesToIndex).onChange(this.scene.onViewChanged.bind(this.scene)).name('Views');
    }

    addLight(lightSwitches, idx, id) {
        this.lights.add(lightSwitches, idx, lightSwitches[idx]).onChange(this.scene.onLightSwitched.bind(this.scene, idx)).name(id);          
    }

    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}