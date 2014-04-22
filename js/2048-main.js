/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 */

require(["2048"], function (_2048) {
	var		board;
	var		grid;
	var		keyboardIsCaptured=false;

	grid = document.getElementById('div_2048_grid');
	// New game with target = 2048, and fresh number value = 2.
	board = _2048.newBoard(grid, 2048, 2);

	// Keyboard arrow handler.
	function keydown_2048(event) {
		var		e;
		var		status='continue', needToStopBubbling=true;

		e = event || window.event;

		// We only respond to the arrow keys.
		switch (e.keyCode) {
		case 37: status = board.playerMove('left'); break;
		case 38: status = board.playerMove('up'); break;
		case 39: status = board.playerMove('right'); break;
		case 40: status = board.playerMove('down'); break;
		default: needToStopBubbling = false; break;
		}

		if (/*status != 'continue' && */status != 'ignore') {
			if (status == 'continue-and-draw')
				{ /* We call draw() later on */ }

			// If game is over:
			if (status == 'failure') {
				alert('Game over: You\'ve lost!. Better luck next time.');
			}

			if (status == 'victory') {
				alert('Congratulations: you\'ve won!');
			}

			board.draw();
		}


		if (needToStopBubbling) {
			if (e.preventDefault) { e.preventDefault(); }
		}

		return needToStopBubbling;
	}

	// When the user clicks on the grid, it toggles the keyboard capture.
	grid.addEventListener('click', function() {
		if (!keyboardIsCaptured) {
			document.addEventListener('keydown', keydown_2048);
			keyboardIsCaptured = true;
			grid.scrollIntoView(true);
		}
		else {
			document.removeEventListener('keydown', keydown_2048);
			keyboardIsCaptured = false;
		}
	});

	// Hook into the reset button.
	document.getElementById('button_2048_reset').addEventListener('click',
		function() {
			board.reset();
			board.draw();
			grid.scrollIntoView(true);
		}
	);

	board.reset();
	board.draw();
});
