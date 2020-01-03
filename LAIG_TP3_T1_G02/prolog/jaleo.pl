:- use_module(library(between)).
:- use_module(library(lists)).
:- include('boards.pl').
:- include('helpers.pl').

action(move).
action(add).

free_action(GameState, NewBoard, Move) :-
	input_move(GameState, M1),
	(move(M1, GameState, NewBoard) ->
		%format('OK~n',[]),
		Move = M1;

		%format('RETRY~n',[]),
		free_action(GameState, NewBoard, Move)
	).

try_player_action(GameState, NewGameState) :-

	clearConsole,
	display_game(GameState),

	get_board(GameState, Board),

	get_stack_options(GameState, AllActions, Len),
	(Len > 0 ->
		format('~nForced to stack: ~n', []),
		force_stack_action(GameState, AllActions, Len, NewBoard),
		LastMove = [];
		
		free_action(GameState, NewBoard, LastMove)
	),
	
	update_gamestate(GameState, NewBoard, NewGameState),
	
	(game_over([NewGameState,LastMove],Winner) ->
		format('~nPlayer ~p is the winner!~n~n',[Winner]);
		try_player_action(NewGameState, NextTurnState)
	).

count_all_pieces([],_, 0).
count_all_pieces([H|T], Type, Count) :-
	count_all_pieces(T, Type, C),
	count_type_pieces(H, Type, CL),
	Count is C+CL.

count_type_pieces([],_, 0).
count_type_pieces([H|T], Type, Count) :-
	count_type_pieces(T, Type, C),
	(H \== Type -> 
		Count is C;
		Count is C + 1
	).

get_pieces_at(Board, [],[]).
get_pieces_at(Board, [Coord|Rest], Pieces) :-
	get_pieces_at(Board, Rest, P1),
	get_cell_at(Coord, Board, Cell),
	append([Cell], P1, Pieces).

game_over([GameState|[LastMove|_]], Winner) :-
	get_player(GameState,Player),
	get_board(GameState,Board),

	(playerWhite(Player) ->
		get_whites(GameState, Discs);
		get_blacks(GameState, Discs)
	),
	
	%length(Discs, NDiscs),

	get_pieces_at(Board, Discs, Pieces),
	count_all_pieces(Pieces, w, Count),

	write(Count),
	((Count > 15) ->

		(playerWhite(Player) -> Winner = black; Winner = white);

		dif(LastMove, []), !,
		extract_move(LastMove, Action, Arg1, Arg2),
		(Action == move ->
			(check_game_over([GameState,Arg1],Winner) ->
				true;
			
				check_game_over([GameState,Arg2],W1),
				(playerWhite(W1) -> Winner = black; Winner = white)
			);
			
			check_game_over([GameState,Arg1],W1),
			(playerWhite(W1) -> Winner = black; Winner = white)
		)
	).

check_game_over([], Winner).
check_game_over([GameState|[Coords|_]], Winner) :-
	get_board(GameState,Board),
	%format('Coords: ~p~n',[Coords]),
	get_cell_at(Coords, Board, [Top|_]),

	((Top == w; Top == b) ->
		get_left_diagonals(Board, Coords,[A|[B|[C|_]]]),

		(travel(Board, A, 4) ->
			get_player(GameState, Winner), !,
			check_game_over([], Winner);

			(travel(Board, B, 4) ->
				get_player(GameState, Winner), !,
				check_game_over([], Winner);

				(travel(Board, C, 4) ->
					get_player(GameState, Winner), !,
					check_game_over([], Winner);

					false
				)
			)
		);

		false
	).

input_move(GameState, Move) :-
	format('Type an action: (add. | move.)~n', []),
	read(Action),

	get_tiles(GameState, Tiles),
	get_whites(GameState, Blacks),
	get_blacks(GameState, Whites),
	
	length(Tiles, NumberActiveTiles),
	length(Blacks, NumberBlacks),
	length(Whites, NumberWhites),

	NumberTiles is (NumberActiveTiles + NumberBlacks + NumberWhites),

	get_rows(GameState, RowSize),
	get_cols(GameState, ColSize),
	pick_add_location(Row1, Col1, ColSize, RowSize),
	(Action == add ->
		((NumberTiles =< 28) -> 
			pick_add_location(Row2, Col2, ColSize, RowSize),
			Move = [Action, [Col1, Row1], [Col2, Row2]];
			
			Move = [Action, [Col1, Row1], []]
		);

		pick_add_location(Row2, Col2, ColSize, RowSize),
		Move = [Action, [Col1, Row1], [Col2, Row2]]
	).

move(Move, GameState, NewBoard) :-
	validate_move(Move, GameState),
	execute_move(Move, GameState, NewBoard).

move_and_update(Move, GameState, NewGameState) :-
	validate_move(Move, GameState),
	execute_move(Move, GameState, NewBoard),
	update_gamestate(GameState, NewBoard, NewGameState).


validate_move(Move, GameState) :-

	extract_move(Move, Action, Arg1, Arg2),
	action(Action),


	(Action == move ->
		validate_move_action(Arg1, Arg2, GameState),
		format('~p: ~p to ~p~n', [Action, Arg1, Arg2]);

		validate_add_action(Arg1, Arg2, GameState),
		format('~p: Piece to ~p and Tile to ~p~n', [Action, Arg1, Arg2])
	).

execute_move(Move, GameState, NewBoard) :-
	extract_move(Move, Action, Arg1, Arg2),
	(Action == move ->
		execute_move_action(Arg1, Arg2, GameState, NewBoard);
		
		get_tiles(GameState, Tiles),
		get_whites(GameState, Blacks),
		get_blacks(GameState, Whites),
		
		length(Tiles, NumberActiveTiles),
		length(Blacks, NumberBlacks),
		length(Whites, NumberWhites),
	
		NumberTiles is (NumberActiveTiles + NumberBlacks + NumberWhites),

		((NumberTiles > 27) -> 
			execute_add_action(Arg1, [], GameState, NewBoard);
			execute_add_action(Arg1, Arg2, GameState, NewBoard))
	).


extract_move([Action|[Arg1|[Arg2]]], Action, Arg1, Arg2).
force_stack_action(GameState, AllActions, Len, NewBoard) :-
	get_board(GameState,Board),
	get_player(GameState,Player),
	
	print_stack_actions(AllActions, 0),
	pick_stack_action(Len, N),
	format('~d~n', [N]),

	get_element_at(AllActions, N, Action),
	get_action_data(Action, Row, Col, Dir),

	replace_cell_at(Board, Col, Row, [t], B1),

	get_adjacent_cell(Col, Row, Dir, ColN, RowN),

	(playerWhite(Player) ->
		replace_cell_at(B1, ColN, RowN, [w,w], NewBoard);
		replace_cell_at(B1, ColN, RowN, [b,b], NewBoard)
	).

execute_stack_action(GameState, Action, NewGameState) :-
	get_board(GameState,Board),
	get_player(GameState,Player),

	get_action_data(Action, Row, Col, Dir),

	replace_cell_at(Board, Col, Row, [t], B1),

	get_adjacent_cell(Col, Row, Dir, ColN, RowN),

	(playerWhite(Player) ->
		replace_cell_at(B1, ColN, RowN, [w,w], NewBoard);
		replace_cell_at(B1, ColN, RowN, [b,b], NewBoard)
	),

	update_gamestate(GameState, NewBoard, NewGameState).

get_stack_action_data(Action, Arg1, Arg2) :-
	get_action_data(Action, Row, Col, Dir),
	get_adjacent_cell(Col, Row, Dir, ColN, RowN),
	Arg1 = [Row, Col],
	Arg2 = [RowN, ColN].

validate_add_action(PieceDst, TileDst, GameState) :-
	get_tiles(GameState, Tiles), !,
	member(PieceDst, Tiles), !,
	get_board(GameState, Board), !,
	(dif(TileDst, []) ->
		get_blacks(GameState, Blacks), !,
		get_whites(GameState, Whites), !,
		append(Tiles, Blacks, L1),
		append(L1, Whites, AllTiles),
		get_empty_adjacent_spaces(Board, AllTiles, [], EmptyAdjSpaces), !,
		member(TileDst, EmptyAdjSpaces); 
		true
	).

execute_add_action(Arg1, Arg2, GameState, NewBoard) :-

	get_board(GameState, Board),
	get_player(GameState, Player),

	(playerWhite(Player) ->
		
		replace_cell_at(Board, Arg1, [w], B1);
		
		replace_cell_at(Board, Arg1, [b], B1)
	),

	(dif(Arg2, []) ->
		replace_cell_at(B1, Arg2, [t], NewBoard);

		NewBoard = B1
	).

update_gamestate(GameState, NewBoard, NewGameState) :-
    get_rows(GameState, RowSize),
    get_cols(GameState, ColSize),
    get_player(GameState, Player),

    get_pieces_of_type_in_board(NewBoard, t, TilesN),
    get_pieces_of_type_in_board(NewBoard, b, BlacksN),
    get_pieces_of_type_in_board(NewBoard, w, WhitesN),
    (playerWhite(Player) -> NextPlayer = black; NextPlayer = white),

    get_pieces_at(NewBoard, TilesN, TP),
	count_all_pieces(TP, t, CT),

    get_pieces_at(NewBoard, BlacksN, BP),
	count_all_pieces(BP, b, CB),

    get_pieces_at(NewBoard, WhitesN, WP),
	count_all_pieces(WP, w, CW),

    NewGameState = [NewBoard, RowSize, ColSize, NextPlayer, TilesN, BlacksN, WhitesN, CT, CB, CW].

get_empty_adjacent_spaces(Board, [], AdjTiles, ValidEmpty) :- sort(AdjTiles, ValidEmpty).
get_empty_adjacent_spaces(Board, [H|T], A, AdjTiles) :-
	get_neighbours(H, Board, Neighbours),
	get_empty_adjacent_spaces_loop(Board, Neighbours, [], EmptyTiles),
	append(A, EmptyTiles, A1),
	get_empty_adjacent_spaces(Board, T, A1, AdjTiles).

get_empty_adjacent_spaces_loop(Board, [], EmptyTiles, EmptyTiles).
get_empty_adjacent_spaces_loop(Board, [[Cell|Coords]|T], E, EmptyTiles) :-
	%get_head(Cell, Piece),
	(Cell == [0] ->
		append(E, [Coords], E1),
		get_empty_adjacent_spaces_loop(Board, T, E1, EmptyTiles);

		get_empty_adjacent_spaces_loop(Board, T, E, EmptyTiles)
	).

print_stack_actions([],_).
print_stack_actions([H|T], N) :-
	format('~d: ~p~n',[N, H]),
	N1 is N+1,
	print_stack_actions(T, N1).


pick_stack_action(Len, N):-
	format('Pick an action...~n', []),
	Len1 is Len - 1,
	(getIntBetter(X, 0, Len1) -> 
		N is X;
		
		pick_stack_action(Len, N)
	).

pick_add_location(Row, Col, ColSize, RowSize):-
	format('Type a location (ex: X:2. Y:4.)...~n', []),

	ColSize1 is ColSize-1,
	RowSize1 is RowSize-1,

	(getIntBetter(X, 0, ColSize1) -> 
	
		(getIntBetter(Y, 0, RowSize1) ->
			Row is Y,
			Col is X;
			pick_add_location(Row, Col, ColSize, RowSize)
		);

		pick_add_location(Row, Col, ColSize, RowSize)
	).


get_stack_moves(GameState, StackActions) :-
	get_stack_options(GameState, AllActions, Len),
	convert_stack_actions(AllActions, StackActions).

convert_stack_actions([], []).
convert_stack_actions([Action|Actions], StackMoves) :-
	convert_stack_actions(Actions, Moves),
	get_stack_action_data(Action, Arg1, Arg2),
	append(Moves, [[Arg1, Arg2, Action]], StackMoves).


get_stack_options([], AllActions, Len) :- length(AllActions, Len).
get_stack_options(GameState, AllActions, Len) :-
	get_board(GameState, Board),
	get_player(GameState, Player),
	
	(playerWhite(Player) ->
		
		get_whites(GameState, Whites),
		check_stack_actions(Board, Whites, [], Actions);
		
		get_blacks(GameState, Blacks),
		check_stack_actions(Board, Blacks, [], Actions)
	),
	calc_symmetric_actions(Actions, [], AllActions),
	get_stack_options([], AllActions, Len).

calc_symmetric_actions([], AllActions, AllActions).
calc_symmetric_actions([H|T], A, AllActions) :-
	append(A, [H], A1),
	calc_symmetric_action(H, A1, A2),
	calc_symmetric_actions(T, A2, AllActions).


calc_symmetric_action(Action, Src, Dst) :-
	get_split_coords(Action, Col, Row),
	get_element_at(Action, 2, Dir),
	get_adjacent_cell(Col, Row, Dir, ColN, RowN),
	(Dir > 3 -> DirN is Dir-3; DirN is Dir+3),
	append(Src, [[ColN, RowN, DirN]], Dst).


check_stack_actions(Board, [], Actions, Actions).
check_stack_actions(Board, [H|T], A, Actions) :-
	get_cell_at(H, Board, Cell),
	length(Cell, Len),
	(Len == 1 -> 
		get_neighbours(H, Board, Neighbours),
		get_head(Cell, Piece),
		check_stack_action_at(Piece, H, Neighbours, 1, [], Situations),
		append(A, Situations, A1),
		check_stack_actions(Board, T, A1, Actions);

		check_stack_actions(Board, T, A, Actions)
	).


check_stack_action_at(Piece, Coords, Neighbours, 4, Situations, Situations) :- !.
check_stack_action_at(Piece, Coords, [H|T], N, S, Situations) :-
	get_head(H, Neighbour),
	length(Neighbour, Len),
	(Len == 1 ->
		get_head(Neighbour, Other),

		(Piece == Other -> 
			%format('~p at ~p -> ~d~n', [Piece, Coords, N]),
			get_split_coords(Coords, X, Y),
			append(S, [[X, Y, N]], S1),
			N1 is N+1,
			check_stack_action_at(Piece, Coords, T, N1, S1, Situations);

			%format('A ~d~n', [N]),
			N1 is N+1,
			check_stack_action_at(Piece, Coords, T, N1, S, Situations)
		);

		%format('B ~d~n', [N]),
		N1 is N+1,
		check_stack_action_at(Piece, Coords, T, N1, S, Situations)
	).

get_pieces_of_type_in_board(Board, Piece, Locations) :-
	get_pieces_of_type_in_board_loop(Board, Piece, 0, [], Locations).

get_pieces_of_type_in_board_loop([], Piece, _, Locations, Locations).
get_pieces_of_type_in_board_loop([H|T], Piece, Row, L, Locations) :-
	get_pieces_of_type_in_row(H, Piece, 0, Row, L, L1),
	RowN is Row+1,
	get_pieces_of_type_in_board_loop(T, Piece, RowN, L1, Locations).

get_pieces_of_type_in_row([], Piece, _, _, Coords, Coords).
get_pieces_of_type_in_row([H|T], Piece, X, Y, N, Coords) :-
	get_head(H, P),
	(P == Piece -> 
		append(N, [[X,Y]], N1),
		XN is X+1,
		get_pieces_of_type_in_row(T, Piece, XN, Y, N1, Coords);

		XN is X+1,
		get_pieces_of_type_in_row(T, Piece, XN, Y, N, Coords)).

get_neighbours(Coords, Board, Neighbours) :-
	get_split_coords(Coords, X, Y),
	get_neighbours(X, Y, Board, Neighbours).

get_neighbours(Col, Row, Board, Neighbours) :-
	get_neighbours_loop(Col, Row, 1, Board, N, Neighbours).

get_neighbours_loop(Col, Row, 7, Board, Neighbours, Neighbours).
get_neighbours_loop(Col, Row, Dir, Board, N, Neighbours) :-
	(is_even(Row) ->
		dir_to_coord_even(Dir, X, Y); dir_to_coord_odd(Dir, X, Y)
	),
	DirN is Dir+1,
	ColN is +(Col,X),
	RowN is +(Row,Y),
	get_cell_at(ColN, RowN, Board, Piece),
	append(N, [[Piece, ColN, RowN]], N1),
	get_neighbours_loop(Col, Row, DirN, Board, N1, Neighbours).


execute_move_action(Src, Dst, GameState, NewBoard) :-

	get_board(GameState, Board),

    get_cell_at(Src, Board, [H|T]),
	get_cell_at(Dst, Board, DstCell),

	length(T,Len),
	(Len == 0 -> 
		replace_cell_at(Board, Src, [t], B1);

		replace_cell_at(Board, Src, T, B1)
	),

	(DstCell == [t] -> 
		%format('H: ~p~n', [H]),
		replace_cell_at(B1, Dst, [H], NewBoard);
		
		%format('H: ~p  Cell: ~p~n', [H, DstCell]),
		replace_cell_at(B1, Dst, [H|DstCell], NewBoard)
	).


validate_move_action(Src,Dst,GameState) :-

	dif(Src, Dst), !,

	get_board(GameState,Board),
	
	get_neighbours(Src, Board, Neighbours), !,
	
	get_cell_at(Dst, Board, DstCell), !,

	member([DstCell|Dst], Neighbours), !,
	
	%[[A],x,y]
	%[x,y] -> [[b],x,y]

    is_not_empty_or_zero(DstCell), !,

	%get_cell_at(Src, Board, [H|T]), !,

	get_player(GameState,Player),

	(playerWhite(Player) ->
		get_whites(GameState,Whites), !,
		member(Src, Whites), !;
        
		get_blacks(GameState,Blacks), !,
        member(Src, Blacks), !
    ).

is_not_empty_or_zero(Cell) :-
    dif(Cell, []), !,
	dif(Cell, [0]), !,
	dif(Cell, [t]), !,
	length(Cell, 1).

get_left_diagonals(Board, Coords,StartPoints) :-
	travel_until_dif(Board, [Coords, 3], StartPointA),
	%format('~p~n', [StartPointA]),
	travel_until_dif(Board, [Coords, 4], StartPointB),
	%format('~p~n', [StartPointB]),
	travel_until_dif(Board, [Coords, 5], StartPointC),
	%format('~p~n', [StartPointC]),
	StartPoints = [[StartPointA, 6], [StartPointB, 1], [StartPointC, 2]].

move_to_cell(Coords, Dir, NextCoords) :-
	get_split_coords(Coords, Col, Row),
	(is_even(Row) ->
dir_to_coord_even(Dir, X, Y); dir_to_coord_odd(Dir, X, Y)
	),
	ColN is +(Col,X),
	RowN is +(Row,Y),
	NextCoords = [ColN, RowN].

travel_until_dif(Board, [], _).
travel_until_dif(Board, [Coords|[Dir|_]], StartCoord) :-

	get_cell_at(Coords, Board, SCell), !,

	move_to_cell(Coords, Dir, NextCoords), !,

	get_cell_at(NextCoords, Board, NCell), !,

	(get_head(SCell,SPiece) ->
		true;

		travel_until_dif(Board, [], [])
	),

	(get_head(NCell,NPiece) ->
		true;

		travel_until_dif(Board, [], Coords)
	),
	
	(SPiece == NPiece -> 
		travel_until_dif(Board, [NextCoords,Dir], StartCoord);
		StartCoord = Coords
	).


travel(_, _, 1).
travel(Board, [Coords|[Dir|_]], N) :-

	N1 is N-1,

	get_cell_at(Coords, Board, SCell), !,

	move_to_cell(Coords, Dir, NextCoords), !,

	get_cell_at(NextCoords, Board, NCell), !,
	get_head(SCell,SPiece),
	get_head(NCell,NPiece),

	(SPiece == NPiece -> 
		travel(Board, [NextCoords,Dir], N1);
		false
	).

valid_moves(GameState, ListOfMoves) :-
    val_all_moves(GameState, add, [9,9], [], ListOfAdd),
    val_all_moves(GameState, move, [9,9], [], ListOfMove),
    append(ListOfAdd, ListOfMove, ListOfMoves).

val_all_moves(_, Action, [], TotalMoves, TotalMoves).
val_all_moves(GameState, Action, Coords, T, TotalMoves) :-
    get_split_coords(Coords, X, Y),
    validate_moves(GameState, Action, [X, Y], [], L1),
    append(T, L1, L2),
    YN is Y-1,
    (YN == -1 ->
        val_all_moves(GameState, Action, [], L2, TotalMoves);

        val_all_moves(GameState, Action, [X, YN], L2, TotalMoves)
    ).

validate_moves(_, Action, [], TotalMoves, TotalMoves).
validate_moves(GameState, Action, Coords, T, TotalMoves) :-
    get_split_coords(Coords, X, Y),
    findall([Action, [X,Y], Arg2], validate_move([Action, [X,Y], Arg2], GameState), ListOfMoves),
    append(T, ListOfMoves, L1),
    XN is X-1,
    (XN == -1 ->
        validate_moves(GameState, Action, [], L1, TotalMoves);

        validate_moves(GameState, Action, [XN, Y], L1, TotalMoves)
    ).


setup_pvp(GameState):-

	% --- Choose one of the boards ---
	initial_board(Board),
	% Middle of the game boards
    % mid_board(Board),
    % mid_board2(Board),
	% Last move to win boards
    %end_game(Board),
	%end_game2(Board),
	% ---------------------------------
	
    %test_board(Board),
	
	length(Board, RowSize),
	
    get_head(Board, Col),
	length(Col, ColSize),
	
	get_pieces_of_type_in_board(Board, t, Tiles),
    get_pieces_of_type_in_board(Board, b, Blacks),
    get_pieces_of_type_in_board(Board, w, Whites),
    
    get_pieces_at(Board, Tiles, TP),
	count_all_pieces(TP, t, CT),

    get_pieces_at(Board, Blacks, BP),
	count_all_pieces(BP, b, CB),

    get_pieces_at(Board, Whites, WP),
	count_all_pieces(WP, w, CW),

	GameState = [Board, RowSize, ColSize, black, Tiles, Blacks, Whites, CT, CB, CW].


pvp:-
	clearConsole,
	format('~nPlayer vs Player ~n',[]),
    setup_pvp(GameState),

    start_game(GameState).

start_game(GameState):-

	get_board(GameState, Board),
	try_player_action(GameState, NewGameState).


main :-
	mainMenu.