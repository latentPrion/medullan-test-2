/*
 * Javascript 2048 implementation.
 * (c) 2014 Kofi Doku Atuah.
 *
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

/*
 * TODO:
 * 	1. [x]When the player cannot collapse or shift in a direction, refuse
 * 	   to spawn a new number.
 *	2. [x]Colours.
 *	3. [ ]Check for end-game conditions (win and failure).
 *	4. [x]Don't redraw if there were no changes to the grid.
 */
define(function () {
	var	MAX_NSQUARES=16, EMPTY_VAL=0;
	var	lib = {};

	function Board(_grid, _targetMaxNum, _newNumVal) {
		this.nEmpty = MAX_NSQUARES;
		this.targetMaxNum = _targetMaxNum;
		this.newNumVal = _newNumVal;
		this.gameOver = false;
		this.grid = _grid;
		this.squares = [
			EMPTY_VAL, EMPTY_VAL, EMPTY_VAL, EMPTY_VAL,
			EMPTY_VAL, EMPTY_VAL, EMPTY_VAL, EMPTY_VAL,
			EMPTY_VAL, EMPTY_VAL, EMPTY_VAL, EMPTY_VAL,
			EMPTY_VAL, EMPTY_VAL, EMPTY_VAL, EMPTY_VAL
		];
	}

	lib.newBoard = function(grid, targetMaxNum, newNumVal) {
		return new Board(grid, targetMaxNum, newNumVal);
	};

	lib.getMaxNSquares = function() { return MAX_NSQUARES; };

	Board.prototype.getTargetMaxNum = function() {
		return this.targetMaxNum;
	};

	Board.prototype.getNewNumVal = function() {
		return this.newNumVal;
	};

	Board.prototype.reset = function() {
		var		i;

		this.gameOver = false;
		for (i=0; i<MAX_NSQUARES; i++) this.squares[i] = EMPTY_VAL;
		this.nEmpty = MAX_NSQUARES;

		// There should be two numbers on the board on reset.
		this.spawnNewNumber();
		this.spawnNewNumber();
	};

	Board.prototype.spawnNewNumber = function() {
		var		rngNum;
		var		i;

		if (this.nEmpty === 0) { return; }

		rngNum = Math.random() * 100 % this.nEmpty;
		rngNum = Math.floor(rngNum);

// console.log(this.nEmpty+' empty, empty index '+rngNum+' will be filled.');
		for (i=0; i<MAX_NSQUARES; i++)
		{
			if (this.squares[i] == EMPTY_VAL && rngNum-- === 0) {
				this.squares[i] = this.newNumVal;
				this.nEmpty--;
			}
		}
	};

	// "stride" can be negative.
	Board.prototype.collapseRow = function(startIndex, stride) {
		var		currIndex, cmpIndex;
		var		collapseWasNecessary=0;
		var		i;

		currIndex = startIndex;
		for (i=0; i<3; i++, currIndex += stride) {
			if (this.squares[currIndex] == EMPTY_VAL) { continue; }

			cmpIndex = currIndex + stride;
			if (this.squares[currIndex] == this.squares[cmpIndex]) {
				this.squares[currIndex] *= 2;
				this.squares[cmpIndex] = EMPTY_VAL;
				this.nEmpty++;
				collapseWasNecessary = 1;
			}
		}

		return collapseWasNecessary;
	};

	Board.prototype.collapseDown = function() {
		var		i;
		var		ret=0;

		for (i=12; i<16; i++) { ret += this.collapseRow(i, -4); }
		return ret;
	};

	Board.prototype.collapseUp = function() {
		var		i;
		var		ret=0;

		for (i=0; i<4; i++) { ret += this.collapseRow(i, 4); }
		return ret;
	};

	Board.prototype.collapseRight = function() {
		var		i;
		var		ret=0;

		for (i=3; i<16; i+=4) { ret += this.collapseRow(i, -1); }
		return ret;
	};

	Board.prototype.collapseLeft = function() {
		var		i;
		var		ret=0;

		for (i=0; i<16; i+=4) { ret += this.collapseRow(i, 1); }
		return ret;
	};

	Board.prototype.shiftRow = function(startIndex, stride) {
		var		currIndex, sourceIndex;
		var		shiftWasNecessary=0;
		var		i;

		currIndex = startIndex;
		for (i=0; i<3; i++, currIndex += stride) {
			if (this.squares[currIndex] != EMPTY_VAL) { continue; }

			sourceIndex = currIndex + stride;
			// Don't waste time copying empty cells.
			if (this.squares[sourceIndex] == EMPTY_VAL) { continue; }

			this.squares[currIndex] = this.squares[sourceIndex];
			this.squares[sourceIndex] = EMPTY_VAL;
			shiftWasNecessary = 1;
		}

		return shiftWasNecessary;
	};

	Board.prototype.shiftDown = function() {
		var		i;
		var		ret=0;

		for (i=12; i<16; i++) {
			// Keep shifting until no more shifting is necessary.
			while (this.shiftRow(i, -4)) { ret++; }
		}

		return ret;
	};

	Board.prototype.shiftUp = function() {
		var		i;
		var		ret=0;

		for (i=0; i<4; i++) {
			while (this.shiftRow(i, 4)) { ret++; }
		}

		return ret;
	};

	Board.prototype.shiftRight = function() {
		var		i;
		var		ret=0;

		for (i=3; i<16; i+=4) {
			while (this.shiftRow(i, -1)) { ret++; }
		}

		return ret;
	};

	Board.prototype.shiftLeft = function() {
		var		i, ret=0;

		for (i=0; i<16; i+=4) {
			while (this.shiftRow(i, 1)) { ret++; }
		}

		return ret;
	};

	Board.prototype.draw = function() {
		var		currIndex;
		var		cells;
		var		i;

		function getColourFor(num) {
			var		i;
			var		colourMap = [
				{num: 2, colour: 'grey'},
				{num: 4, colour: 'brown'},
				{num: 8, colour: 'teal'},
				{num: 16, colour: 'red'},
				{num: 32, colour: 'pink'},
				{num: 64, colour: 'purple'},
				{num: 128, colour: 'blue'},
				{num: 256, colour: 'green'},
				{num: 512, colour: 'white'},
				{num: 1024, colour: 'yellow'},
				{num: 2048, colour: 'gold'}
			];

			if (num == EMPTY_VAL) { return ''; }
			for (i=0; i<colourMap.length; i++) {
				if (colourMap[i].num == num) {
					return colourMap[i].colour;
				}
			}

			return '';
		}

		cells = this.grid.getElementsByTagName('div');

		for (i=0, currIndex=0; i<16; i++, currIndex++) {
			cells[i].style.backgroundColor = getColourFor(this.squares[currIndex]);
			cells[i].innerHTML = '<span class="cell-number">' +
				((this.squares[currIndex] === 0) ? '' : this.squares[currIndex]) +
				'</span>';
		}
	};

	Board.prototype.playerMove = function(direction) {
		var		shifted=0, collapsed=0;

		if (this.gameOver) { return 'ignore'; }

		switch (direction) {
		case 'right':
			shifted = this.shiftRight();
			collapsed = this.collapseRight();
			shifted += this.shiftRight();
			break;
		case 'left':
			shifted = this.shiftLeft();
			collapsed = this.collapseLeft();
			shifted += this.shiftLeft();
			break;
		case 'up':
			shifted = this.shiftUp();
			collapsed = this.collapseUp();
			shifted += this.shiftUp();
			break;
		case 'down':
			shifted = this.shiftDown();
			collapsed = this.collapseDown();
			shifted += this.shiftDown();
			break;
		}

		if (shifted || collapsed)
			{ this.spawnNewNumber(); }

		if (this.checkForVictoryCondition()) { return 'victory'; }
		if (this.checkForFailureCondition()) { return 'failure'; }

		return (shifted + collapsed > 0) ?
			'continue-and-draw' : 'continue';
	};

	Board.prototype.checkForVictoryCondition = function() {
		/* If any square has a value of this.targetMaxNum, the
		 * victory condition is satisfied.
		 **/
		if (this.squares.indexOf(this.targetMaxNum) != -1) {
			this.gameOver = true;
		}

		return this.gameOver;
	};

	// "Stride" can be negative.
	Board.prototype.checkRowForMergeableSquares = function(startIndex, stride) {
		var		i, currIndex, cmpIndex;

		currIndex = startIndex;
		for (i=0; i<3; i++, currIndex += stride) {
			cmpIndex = currIndex + stride;

			if (this.squares[currIndex] == this.squares[cmpIndex]) {
				return true;
			}
		}

		return false;
	};

	Board.prototype.checkForFailureCondition = function() {
		var		i;

		/**	EXPLANATION:
		 * The board must first be full. We need to check each row, and
		 * then each column.
		 *
		 * If the board is full, and we cannot find any contiguous blocks
		 * that can be merged, the player has failed.
		 **/
		if (this.nEmpty !== 0) { return false; }

		for (i=0; i<16; i+=4) {
			if (this.checkRowForMergeableSquares(i, 1)) {
				return false;
			}
		}
		for (i=0; i<4; i++) {
			if (this.checkRowForMergeableSquares(i, 4)) {
				return false;
			}
		}

		return (this.gameOver = true);
	};

	return lib;
});
