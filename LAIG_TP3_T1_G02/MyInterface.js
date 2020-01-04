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

        // this.filenameIndex = 0;

        this.lights = this.gui.addFolder('Lights');
        
        this.show_start_options(this.scene);

        this.initKeys();
        
        return true;
    }

    addViews() {
        this.gui.add(this.scene, 'selectedView', this.scene.viewNamesToIndex).onChange(this.scene.onViewChanged.bind(this.scene)).name('Views');
    }

    addLight(lightSwitches, idx, id) {
        this.lights.add(lightSwitches, idx, lightSwitches[idx]).onChange(this.scene.onLightSwitched.bind(this.scene, idx)).name(id);          
    }

    addScenes() {
        this.gui.add(this.scene, 'selectedScene', this.scene.graphNames).onChange(this.scene.onSceneChanged.bind(this.scene)).name('Scenes');
    }

    clean_folder() {
        if(this.curr_folder != null){
            this.gui.removeFolder(this.curr_folder);
            this.curr_folder = null;
        }
    }

    add_quit_button(group) {
        group.add(this, 'quit').name("Quit Server.");
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
      
        group.add(ctx, "clear_turn").name("Clear Input");
        group.add(ctx, "undo_turn").name("Undo turn");
        group.add(ctx, "redo_turn").name("Redo turn");
        group.add(ctx, "reset_game").name("Restart game");
        group.add(ctx, "go_to_start").name("To start menu");
        this.add_quit_button(group);

        this.curr_folder = group;
    }

    show_game_over_menu(ctx) {

        this.clean_folder();

        let group = this.gui.addFolder("Game Over!");
        group.open();
      
        group.add(ctx, "reset_game").name("New game?");
        group.add(ctx, "go_to_start").name("To start menu?");
        this.add_quit_button(group);

        this.curr_folder = group;
    }

    update_panel_player(player) {
        document.getElementById("player").innerText = player ? "Player: " + player : "";
    }

    update_panel_time(time) {
        document.getElementById("time").innerText = time ? "\nTime: " + time : ""; 
    }

    update_panel_info(info) {
        document.getElementById("information").innerText = info ? "\nInformation: " + info : "";
    }

    update_panel_game_over(message) {
        document.getElementById("game_over_message").innerText = message;
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
        // if(event.key === 'm') {
        //     if(this.filenameIndex == 0) this.filenameIndex++
        //     else if(this.filenameIndex == 1) this.filenameIndex--;
        //     console.log(this.filenameIndex);
        // }
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}