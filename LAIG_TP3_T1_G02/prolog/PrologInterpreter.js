class PrologInterpreter {
    
    static send_request(requestString, onSuccess, onError, port) {

        let requestPort = port || 8081;

        //console.log(requestString);
        
        var onload = onSuccess || function(data) { console.log("Request successful. Reply: " + data); };
        var onerror = onError || function(error) { console.log("Error waiting for response | ", error); };

        fetch('http://localhost:'+requestPort+'/'+requestString)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                onload(data);
            })
            .catch(function (error) {
                onerror(error);
            });
    }

    static send_quit() { PrologInterpreter.send_request("quit"); }


    static send_setup_pvp(onSuccess) {
        PrologInterpreter.send_request("setup_pvp(GameState)", onSuccess);
    }

    static send_action(action, arg1, arg2, gamestate, onSuccess) {
        arg1 = JSON.stringify(arg1.reverse());
        arg2 = JSON.stringify(arg2.reverse());
        gamestate = JSON.stringify(gamestate).replace(/"| /g, '');

        let cmd = `move_and_update([${action},${arg1},${arg2}],${gamestate},NewBoard)`;
        PrologInterpreter.send_request(cmd, onSuccess); 
    }

    static request_empty_adj(board, all_tiles, onSuccess) {

        board = JSON.stringify(board).replace(/"| /g, '');
        all_tiles = JSON.stringify(all_tiles).replace(/"| /g, '');

        let cmd = `get_empty_adjacent_spaces(${board},${all_tiles},EmptyAdjSpaces)`;
        PrologInterpreter.send_request(cmd, onSuccess); 
    }

    static request_stack_status(gamestate, onSuccess) {

        gamestate = JSON.stringify(gamestate).replace(/"| /g, '');

        let cmd = `get_stack_moves(${gamestate},StackMoves)`;
        PrologInterpreter.send_request(cmd, onSuccess); 
    }

    static send_stack_action(action, gamestate, onSuccess) {
        action = JSON.stringify(action);
        gamestate = JSON.stringify(gamestate).replace(/"| /g, '');

        let cmd = `execute_stack_action(${gamestate},${action},NewGameState)`;
        PrologInterpreter.send_request(cmd, onSuccess); 
    }

    static request_gameover_status(gamestate, last_move, onSuccess) {
        last_move = JSON.stringify(last_move).replace(/"| /g, '');
        gamestate = JSON.stringify(gamestate).replace(/"| /g, '');

        let cmd = `game_over(${gamestate},${last_move},Winner)`;
        PrologInterpreter.send_request(cmd, onSuccess);
    }
}