class PrologInterpreter {
    
    static send_request(requestString, onSuccess, onError, port) {

        let requestPort = port || 8081;

        console.log(requestString);
        
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

    static send_action(action, arg1, arg2, gamestate, onSuccess) {
        arg1 = JSON.stringify(arg1.reverse());
        arg2 = JSON.stringify(arg2.reverse());
        gamestate = JSON.stringify(gamestate).replace(/"| /g, '');

        let cmd = `moveAndUpdate([${action},${arg1},${arg2}],${gamestate},NewBoard)`;
        console.log(cmd);
        PrologInterpreter.send_request(cmd, onSuccess); 
    }
}