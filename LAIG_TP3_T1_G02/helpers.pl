% query if N is even
is_even(N) :-
    K is N//2,
    N =:= K*2.

get_head([H|_], H).

get_head_tail([H|T], H, T).

push_head(L, H, [H|L]).

% get list element | -List, -Index, +Element
get_element_at([],_,[]).
get_element_at([H|_],0,H).
get_element_at([_|T],Idx,Elem):-
    Idx1 is Idx-1,
    get_element_at(T,Idx1,Elem).

% get cell content | -Coords, -Board, +Cell
get_cell_at(Coords, Board, Cell) :-
	get_split_coords(Coords, X, Y),
	get_cell_at(X, Y, Board, Cell).

% get cell content | -Col, -Row, -Board, +Cell
get_cell_at(X, Y, Board, Cell) :-
    get_element_at(Board, Y, Row),
    get_element_at(Row, X, Cell).

get_split_coords([Col|Y], Col, Row) :-
    get_head(Y, Row).

get_action_data([Col|T], Row, Col, Dir) :-
    get_head(T, Row),
    get_element_at(T, 1, Dir).

get_adjacent_cell(Col, Row, Dir, ColN, RowN) :-
	(is_even(Row) -> dir_to_coord_even(Dir, X, Y); dir_to_coord_odd(Dir, X, Y)),
	ColN is +(Col,X), %TODO switch is with =
	RowN is +(Row,Y).

% remove element | -Index, -List, +NewList
remove_element_at(0, [Head|Y], Y).
remove_element_at(N, [Head|NY], [Head|Y]) :-
    K is N-1,
    remove_element_at(K, NY, Y).

divide_list(_, [], Dst, [], Dst).
divide_list(0, Rest, Dst, Rest, Dst).
divide_list(I, [H|T], Tmp, Rest, Dst) :-
	I1 is I-1,
	divide_list(I1, T, [H|Tmp], Rest, Dst).

replace_head([], Element, []).
replace_head([H|T], Element, [Element|T]).

merge_inv_list([], Final, Final).
merge_inv_list([H|T], Rest, Final) :-
	merge_inv_list(T, [H|Rest], Final).

replace_element_at(I, Element, L, Final) :-
	divide_list(I, L, [], Rest, InvHead),
	replace_head(Rest, Element, NewRest),
	merge_inv_list(InvHead, NewRest, Final).

add_element(Index, L, Element, Final) :-
    nth0(Index, Final, Element, L).


% get cell content | -Coords, -Board, +Cell
replace_cell_at(Board, Coords, Element, NewBoard) :-
	get_split_coords(Coords, X, Y),
	replace_cell_at(Board, X, Y, Element, NewBoard).

replace_cell_at(Board, X, Y, Element, NewBoard):-
    get_element_at(Board, Y, Row),
    %format('~p~n~n',[Row]),
    replace_element_at(X, Element, Row, NewRow),
    %format('~p~n~n',[NewRow]),
    replace_element_at(Y,NewRow,Board,NewBoard).


remove_cell_at(Board, Coords, NewBoard) :-
	get_split_coords(Coords, X, Y),
	remove_cell_at(Board, X, Y, Element, NewBoard).

remove_cell_at(Board, X, Y, NewBoard) :-
    get_element_at(Board, Y, Row),
    remove_element_at(X, Row, NewRow),
    replace_element_at(Y,NewRow,Board,NewBoard).



%convert direction to col,row coords---
dir_to_coord_odd(1, 1, 0).
dir_to_coord_odd(2, 1, 1).
dir_to_coord_odd(3, 0, 1).
dir_to_coord_odd(4, -1, 0).
dir_to_coord_odd(5, 0, -1).
dir_to_coord_odd(6, 1, -1).
dir_to_coord_odd(_, 0, 0).

dir_to_coord_even(1, 1, 0).
dir_to_coord_even(2, 0, 1).
dir_to_coord_even(3, -1, 1).
dir_to_coord_even(4, -1, 0).
dir_to_coord_even(5, -1, -1).
dir_to_coord_even(6, 0, -1).
dir_to_coord_even(_, 0, 0).
%--------------------------------------

playerWhite(white).
playerWhite([w]).

get_board(GameState, Board):-
	get_head(GameState, Board).

get_rows(GameState, Rows):-
	get_element_at(GameState, 1, Rows).

get_cols(GameState, Cols):-
	get_element_at(GameState, 2, Cols).

get_player(GameState, Player):-
	get_element_at(GameState, 3, Player).

get_tiles(GameState, Tiles):-
	get_element_at(GameState, 4, Tiles).

get_blacks(GameState, Blacks):-
	get_element_at(GameState, 5, Blacks).

get_whites(GameState, Whites):-
	get_element_at(GameState, 6, Whites).