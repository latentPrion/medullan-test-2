
require(["tic-tac-toe"], function(ttt) {
	var		board, grid, gridSquares, i;

	grid = document.getElementById('div_ttt_grid');
	gridSquares = grid.getElementsByTagName('div');
	board = ttt.newTicTacToeBoard(grid, 'div');

	document.getElementById('button_ttt_reset').addEventListener('click', function() {
		board.reset('hard', 'ai');
		board.draw();
	});

	grid.addEventListener('click', function() {
		grid.scrollIntoView(true);
	});

	function gridSquare_onClick_handler(event) {
		var		result, e, sourceElement;

		e = event || window.event;
		sourceElement = e.target || e.srcElement;

		result = board.clickEvent(sourceElement.gridNo);
		board.draw();
		if (result == 'continue' || result == 'ignore') { return; }

		if (result == 'tie') {
			alert('Game over. Neither player wins.');
		}
		else {
			alert(result +' wins!');
		}
	}

	for (i=0; i<board.squares.length; i++) {
		gridSquares[i].gridNo = i;
		gridSquares[i].addEventListener(
			'click', gridSquare_onClick_handler);
	}

	board.reset('hard', 'ai');
	board.draw();
});
