
require(["tic-tac-toe"], function(ttt) {
	var		board, grid, gridSquares, i;

	grid = document.getElementById('div_ttt_grid');
	gridSquares = grid.getElementsByTagName('div');
	board = ttt.newTicTacToeBoard(grid, 'div');

	function filterElementsByNodeName(elems, name) {
		var		i, retArray = [];

		for (i=0; i<elems.length; i++) {
			if (elems[i].name == name)
				{ retArray.push(elems[i]); }
		}

		return retArray;
	}

	function ttt_getSelectedDifficulty() {
		var		i, radios, diffRadios;

		radios = document.getElementsByTagName('input');
		diffRadios = filterElementsByNodeName(radios, 'rad_ttt_difficulty');

		for (i=0; i<diffRadios.length; i++) {
			if (diffRadios[i].checked)
				{ return diffRadios[i].value; }
		}

		console.log('EXCEPTION: No radio value for difficulty is checked. Returning hard mode.');
		return 'hard';
	}

	function ttt_getSelectedMode() {
		var		i, radios, modeRadios;

		radios = document.getElementsByTagName('input');
		modeRadios = filterElementsByNodeName(radios, 'rad_ttt_mode');

		for (i=0; i<modeRadios.length; i++) {
			if (modeRadios[i].checked)
				{ return modeRadios[i].value; }
		}

		console.log('EXCEPTION: No radio value for mode is checked. Returning AI mode.');
		return 'ai';
	}

	document.getElementById('button_ttt_reset').addEventListener('click', function() {
		board.reset(ttt_getSelectedDifficulty(), ttt_getSelectedMode());
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

	board.reset(ttt_getSelectedDifficulty(), ttt_getSelectedMode());
	board.draw();
});
