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

        this.debug = this.gui.addFolder('Debug');
        this.debug.add(PrologInterpreter, 'send_quit').name("Quit Server.");
        this.resetLights();

        this.views = null;

        this.go_to_start = null;

        this.gui.add(this.scene, 'rotate_camera').name('Enable rotation');
        
        this.curr_folder = null;
        
        this.initKeys();
        
        return true;
    }

    addLight(lightSwitches, idx, id) {
        if(this.lights == null)
            this.resetLights();

        this.lights.add(lightSwitches, idx, lightSwitches[idx]).onChange(this.scene.onLightSwitched.bind(this.scene, idx)).name(id);          
    }

    resetLights() {
        if(this.lights != null) {
            this.gui.removeFolder(this.lights);
        }
        this.lights = this.gui.addFolder('Lights');
    }

    addViews() {
        if(this.views != null)
            this.gui.remove(this.views);
        this.views = this.gui.add(this.scene, 'selectedView', this.scene.viewNames).onChange(this.scene.onViewChanged.bind(this.scene)).name('Views');
    }

    addScenes() {
        this.gui.add(this.scene, 'selectedScene', this.scene.graphNames).onChange(this.scene.onSceneChanged.bind(this.scene)).name('Scenes');
    }


    // State UI Menus
    show_start_options(ctx) {

        this.clean_folder();

        this.hide_go_to_start();

        let group = this.gui.addFolder("Start Menu");
        group.open();
      
        group.add(ctx, "start_game").name("Start Game!");
        group.add(ctx.fsm.scene, 'game_mode', [ 'PvsP', 'PvsB', 'BvsB' ]).name("Game Mode");
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
        group.add(ctx, "go_to_start").name("To start menu");
        this.add_quit_button(group);

        this.curr_folder = group;
    }

    show_go_to_start(ctx) {
        this.hide_go_to_start();
        this.go_to_start = this.gui.add(ctx, "go_to_start").name("To start menu");
    }

    hide_go_to_start() {
        if(this.go_to_start != null)
            this.gui.remove(this.go_to_start);
    }

    show_game_over_menu(ctx) {

        this.clean_folder();

        if(this.go_to_start != null)
            this.gui.remove(this.go_to_start);

        let group = this.gui.addFolder("Game Over!");
        group.open();
        group.add(ctx, "go_to_start").name("To start menu");
        group.add(ctx, "show_game_film").name("Play game film");
        this.add_quit_button(group);

        this.curr_folder = group;
    }


    
    // Helpers
    clean_folder() {
        if(this.curr_folder != null){
            this.gui.removeFolder(this.curr_folder);
            this.curr_folder = null;
        }
    }

    add_quit_button(group) {
        group.add(PrologInterpreter, 'send_quit').name("Quit Server.");
    }



    // HTML UI
    clean_panel() {
        this.update_panel_player("");
        this.update_panel_time("");
        this.update_panel_blacks("");
        this.update_panel_whites("");
        this.update_panel_tiles("");
        this.update_panel_info("");
        this.update_panel_game_over("");
    }

    hide_panel() {
		document.getElementById("panel").style.display = "none";
    }
    show_panel() {
		document.getElementById("panel").style.display = "block";
    }

    hide_game_over() {
		document.getElementById("game_over").style.display = "none";
		document.getElementById("panel").style.display = "block";
    }
    
    show_game_over() {
		document.getElementById("game_over").style.display = "block";
		document.getElementById("panel").style.display = "none";
    }

    update_panel_player(player) {
        document.getElementById("player").innerText = player ? "Player: " + player : "";
    }

    update_panel_blacks(blacks) {
        document.getElementById("blacks").innerText = blacks ? "Available blacks: " + blacks : "";
    }

    update_panel_whites(whites) {
        document.getElementById("whites").innerText = whites ? "Available whites: " + whites : "";
    }

    update_panel_tiles(tiles) {
        document.getElementById("tiles").innerText = tiles ? "Available tiles: " + tiles : "";
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


    // Keyboard
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