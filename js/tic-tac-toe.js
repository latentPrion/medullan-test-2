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

define(function() {
	var		MARK_X='X', MARK_O='O', MARK_EMPTY='';
	var		CENTER_SQUARE=4,
			TOP_SQUARE=1, RIGHT_SQUARE=5,
			BOTTOM_SQUARE=7, LEFT_SQUARE=3;
	var		lib = {};

	/* This is a list of ways for the AI to win. The AI will start each
	 * game by selecting a plan. After each time the user makes a move, the
	 * AI will check the plan to make sure it can still be executed.
	 *
	 * If the plan is no longer achievable, the AI will attempt to choose
	 * another plan.
	 *
	 * If it cannot find a plan that can be executed, it will
	 * select the "lossPlan", which is to just fill in squares until the
	 * match is over.
	 **/
	lib.lossPlan = [
		MARK_O, MARK_O, MARK_O,
		MARK_O, MARK_O, MARK_O,
		MARK_O, MARK_O, MARK_O
	];

	lib.plans = [
		[
			MARK_O, MARK_O, MARK_O,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY
		],
		[
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_O, MARK_O, MARK_O,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY
		],
		[
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_O, MARK_O, MARK_O
		],
		[
			MARK_O, MARK_EMPTY, MARK_EMPTY,
			MARK_O, MARK_EMPTY, MARK_EMPTY,
			MARK_O, MARK_EMPTY, MARK_EMPTY
		],
		[
			MARK_EMPTY, MARK_O, MARK_EMPTY,
			MARK_EMPTY, MARK_O, MARK_EMPTY,
			MARK_EMPTY, MARK_O, MARK_EMPTY
		],
		[
			MARK_EMPTY, MARK_EMPTY, MARK_O,
			MARK_EMPTY, MARK_EMPTY, MARK_O,
			MARK_EMPTY, MARK_EMPTY, MARK_O
		],
		[
			MARK_O, MARK_EMPTY, MARK_EMPTY,
			MARK_EMPTY, MARK_O, MARK_EMPTY,
			MARK_EMPTY, MARK_EMPTY, MARK_O
		],
		[
			MARK_EMPTY, MARK_EMPTY, MARK_O,
			MARK_EMPTY, MARK_O, MARK_EMPTY,
			MARK_O, MARK_EMPTY, MARK_EMPTY
		]
	];

	function TicTacToeBoard(_grid, _gridElementTagName) {
		var		i;

		this.grid = _grid;
		this.gridElementTagName = _gridElementTagName;
		this.currentPlan = null;
		this.currentPlayer = MARK_X;

		this.haveCenterSquare = 0;
		this.haveTopSquare = 0;
		this.haveRightSquare = 0;
		this.haveBottomSquare = 0;
		this.haveLeftSquare = 0;

		this.squares = [
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY,
			MARK_EMPTY, MARK_EMPTY, MARK_EMPTY
		];

		this.nEmpty = this.squares.length;
	}

	lib.newTicTacToeBoard = function(grid) {
		return new TicTacToeBoard(grid);
	};

	/* These *squareSet() functions are used when the AI is determining the
	 * most potent strategy to employ to win.
	 **/
	lib.centerSquareSet = function(plan) {
		return plan[CENTER_SQUARE] != MARK_EMPTY;
	};

	lib.topSquareSet = function(plan) {
		return plan[TOP_SQUARE] != MARK_EMPTY;
	};

	lib.rightSquareSet = function(plan) {
		return plan[RIGHT_SQUARE] != MARK_EMPTY;
	};

	lib.bottomSquareSet = function(plan) {
		return plan[BOTTOM_SQUARE] != MARK_EMPTY;
	};

	lib.leftSquareSet = function(plan) {
		return plan[LEFT_SQUARE] != MARK_EMPTY;
	};

	lib.edgeSquareSet = function(plan) {
		return this.topSquareSet(plan) || this.rightSquareSet(plan)
			|| this.bottomSquareSet(plan)
			|| this.leftSquareSet(plan);
	};

	TicTacToeBoard.prototype.reset = function(_difficulty, _mode) {
		var		i;

		this.currentPlan = null;
		this.haveCenterSquare
			= this.haveTopSquare = this.haveRightSquare
			= this.haveBottomSquare = this.haveLeftSquare = 0;

		switch (_difficulty) {
		case 'easy': this.difficulty = 'easy'; break;
		case 'hard': this.difficulty = 'hard'; break;
		default: this.difficulty = 'normal';
		}

		switch (_mode) {
		case 'two-player':
		case 'twoplayer':
		case '2-player':
		case '2player':
		case 'multiplayer':
			this.mode = 'two-player';
			break;
		default:
			this.mode = 'single-player';
			break;
		}

		this.nEmpty = this.squares.length;
		for (i=0; i<this.squares.length; i++) {
			this.squares[i] = MARK_EMPTY;
		};

		this.selectFirstPlayer();
		if (mode == 'single-player') {
			this.selectInitialPlan();

			// AI is always the O player, and not the X player.
			if (this.currentPlayer == MARK_O) {
				// If AI is the first player, we make our move.
				this.aiPlay();
				// Don't forget to set currentPlayer to MARK_X.
				this.changePlayer();
			}
		}
	};

	TicTacToeBoard.prototype.selectFirstPlayer = function() {
		var		rngNum;

		/* Decide who goes first. Randomly chosen.
		 * May the luckiest man win.
		 **/
		rngNum = Math.floor(Math.random() * 10);
		rngNum %= 2;

		this.currentPlayer = (rngNum === 0)
			? MARK_X : MARK_Y;
	}

	TicTacToeBoard.prototype.setSquare = function(square, mark) {
		this.squares[square] = mark;
		this.nEmpty--;
	};

	TicTacToeBoard.prototype.selectInitialPlan = function() {
		var		rngNum;

		/* Use RNG to select a plan so that the AI isn't predictable.
		 * We don't weigh the viability of the first plan since that
		 * would place the user at a significant disadvantage:
		 *
		 * It would mean that the AI would always select a centre-square
		 * plan and fill out the centre square. As long as the initial
		 * plan's viability is not 0, we use it.
		 **/
		while (true)
		{
			rngNum = Math.floor(Math.random() * 100);
			rngNum %= lib.plans.length;

			/* Just use the first one that isn't unviable.
			 * The reason we have to check multiple plans is because
			 * the user may have had the first turn, and may have
			 * already placed an X on the board.
			 *
			 * So when the user gets the first turn, the AI has to
			 * make sure that the first plan it chooses isn't
			 * unviable right off the bat.
			 *
			 * Most of the time this loop will probably only run
			 * once.
			 **/
			if (this.getPlanViability(lib.plans[rngNum]) > 0) {
				this.currentPlan = lib.plans[rngNum];
				console.log('Selected initial plan '+rngNum);
				return;
			}
		}
	};

	TicTacToeBoard.prototype.selectNewPlan = function() {
		var		highestViability, currentViability,
				bestPlan, bestPlanIndex;
		var		i;

		/**	EXPLANATION:
		 * To select a new plan, we need to go through all the plans
		 * one by one, keeping track of the most viable one. At the end,
		 * we choose the most viable plan and set it as our new
		 * current plan.
		 **/

		bestPlanIndex = 0;
		highestViability = 0;
		for (i=0; i<lib.plans.length; i++) {
			currentViability = this.getPlanViability(lib.plans[i]);
			if (currentViability === 0) { continue; }

			if (currentViability > highestViability) {
				highestViability = currentViability;
				bestPlan = lib.plans[i];
				bestPlanIndex = i;
			}
		}

		// If none of the plans were viable, we must select the loss plan.
		if (highestViability === 0) {
			bestPlan = lib.lossPlan;
			console.log('Selected loss plan');
		}
		else {
			console.log('Selected new plan '+bestPlanIndex +
				' with viability '+highestViability);
		}

		// We now have our new plan.
		this.currentPlan = bestPlan;
	};

	TicTacToeBoard.prototype.getPlanViability = function(plan) {
		var		i;
		var		viability=0;

		/**	EXPLANATION:
		 * If one of the squares for a plan is owned by the user,
		 * the plan automatically gets a viability rating of 0, and is
		 * skipped. A plan is only viable if all of its squares are
		 * available for the AI to use.
		 *
		 * All viable plans will have a base viability of 3 for matching
		 * all three of their squares as "empty" (unused by both players.)
		 *
		 * Optimal plans are those with squares that the AI ALREADY owns.
		 * For every square that the AI owns that is part of a plan, that
		 * plan gets +1 point extra.
		 *
		 * This way, optimal plans (those that involve squares we already
		 * own) will be rated higher than viable plans (those that will
		 * require more work).
		 *
		 * Additionally plans that involve the center square or an edge
		 * square will have the highest priority since those hold the
		 * highest strategic advantage.
		 **/

		/* If the plan is a center square plan, increase the
		 * viability of the plan by 2.
		 **/
		if (lib.centerSquareSet(plan)) { viability += 2; }

		/* If the plan is an edge square plan, increase the
		 * viability by 1.
		 **/
		if (lib.edgeSquareSet(plan)) { viability++; }

		for (i=0; i<this.squares.length; i++) {
			// Don't waste time testing squares that aren't in the plan.
			if (plan[i] == MARK_EMPTY) { continue; }

			/* If the user has already occupied one of the squares
			 * needed for this plan, skip the plan and return a
			 * value of 0 for its viability.
			 **/
			if (this.squares[i] == MARK_X) { return 0; }

			/* If we already own the square, increase the
			 * viability of the plan.
			 **/
			if (this.squares[i] == MARK_O) { viability++; }

			// Add on the base viability.
			viability++;
		}

		return viability;
	};

	TicTacToeBoard.prototype.aiPlay = function() {
		var		currPlan, bestPlan;
		var		i;

		/**	EXPLANATION:
		 * This function basically encapsulates and implements the AI's
		 * logic for playing. It decides which square the AI will fill
		 * next.
		 *
		 * We just first check to see if our current plan is still
		 * valid. If it is, we make a move. If it isn't, we choose
		 * another plan. If we can't find a viable plan, we choose the
		 * loser plan.
		 *
		 * 	MAKING A MOVE:
		 * To make a move, go through all plans and get their viability.
		 * We then choose the most viable one, and follow it.
		 * 	* In "easy" difficulty, even if our plan has a center
		 *	  or side square, we ignore them and play in sequential
		 *	  order.
		 * 	* In "normal" difficulty, if our plan has a side square,
		 *	  we play it first, but we still ignore center-square
		 *	  plays.
		 * 	* In "hard" difficulty, if our plan has a center square,
		 * 	  we play the center square first, then any side
		 *	  squares, followed by any other squares.
		 *
		 * Hard mode basically makes the AI sieze upon the center square
		 * whenever it can.
		 **/

		/* When the AI is about to play, it must evaluate its current
		 * plan first, in case the user's move has rendered it unviable.
		 *
		 * If the current plan is now unviable, we select a new plan,
		 * potentially giving up and going to the loss plan as well.
		 *
		 * Then we execute the next step in whichever plan is now our
		 * current plan.
		 **/
		if (this.getPlanViability(this.currentPlan) === 0) {
			this.selectNewPlan();
		}

		this.aiExecuteNextStep();
	};

	TicTacToeBoard.prototype.aiExecuteNextStep = function() {
		var		i;

		/**	EXPLANATION:
		 * To execute a step in a plan, we just look for the first square
		 * that is set in the plan, (and not set in the grid) and set
		 * it in the grid.
		 **/

		/**	FIXME:
		 * When the AI is executing the "loss" plan, it can begin over
		 * writing squares that the user owns. This is due to the logic
		 * that governs this function.
		 *
		 * The reason this can take place is that when the AI tests the
		 * viability of the "loss" plan in "aiPlay()", it will always
		 * get a "viable" answer. So it will always come here thinking
		 * it is executing a viable plan.
		 *
		 * This function is also currently coded to assume that if a plan
		 * was "viable" according to the test that was done by its caller,
		 * then all of the squares required by the plan are owned by the
		 * AI, or else available for taking.
		 *
		 * When the "loss" plan is being executed, this is not the case
		 * since the loss plan just has all squares set. It will, then,
		 * cause the AI to cheat by claiming squares that the user owns.
		 **/
		// HARD mode: check for centre square availability.
		if (this.difficulty == 'hard' && lib.centerSquareSet(this.currentPlan)) {
			if (!lib.centerSquareSet(this.squares)) {
				// Sieze the center square!
				this.setSquare(CENTER_SQUARE, MARK_O);
				return;
			}
		}

		// NORMAL mode: check for edge square availability.
		if (this.difficulty == 'normal' && lib.edgeSquareSet(this.currentPlan)) {
			var		top, bottom, left, right;

			// Which edge(s) are set in the plan?
			top = lib.topSquareSet(this.currentPlan);
			bottom = lib.bottomSquareSet(this.currentPlan);
			left = lib.leftSquareSet(this.currentPlan);
			right = lib.rightSquareSet(this.currentPlan);

			if (top && !lib.topSquareSet(this.squares)) {
				this.setSquare(TOP_SQUARE, MARK_O);
				return;
			}
			if (bottom && !lib.bottomSquareSet(this.squares)) {
				this.setSquare(BOTTOM_SQUARE, MARK_O);
				return;
			}
			if (left && !lib.leftSquareSet(this.squares)) {
				this.setSquare(LEFT_SQUARE, MARK_O);
				return;
			}
			if (right && !lib.rightSquareSet(this.squares)) {
				this.setSquare(RIGHT_SQUARE, MARK_O);
				return;
			}
		}

		/* If the plan is not a center or edge square plan, or it is but
		 * we already own the squares in question, proceed to set
		 * squares as normal.
		 **/
		for (i=0; i<this.squares.length; i++) {
			// Skip empty squares in the plan.
			if (this.currentPlan[i] == MARK_EMPTY) { continue; }
			// Skip squares in the plan that we already own on the grid.
			if (this.squares[i] != MARK_EMPTY) { continue; }

			this.setSquare(i, MARK_O);
		}
	};

	TicTacToeBoard.prototype.userPlay =  function(square) {
		// Set square for the current player.
		this.setSquare(square, this.currentPlayer);
	}

	TicTacToeBoard.prototype.changePlayer = function() {
		this.currentPlayer = (this.currentPlayer == MARK_X)
			? MARK_O : MARK_X;
	}

	TicTacToeBoard.prototype.clickEvent = function(square) {
		// Ignore clicks if the board is filled out.
		if (this.nEmpty === 0) { return 0; }

		// Ignore clicks on already-filled squares. No cheating.
		if (this.squares[square] != MARK_EMPTY) { return 0; }

		this.userPlay(square);
		// Check for tie/victory condition.
		if (this.checkForVictoryCondition())
			{ return this.currentPlayer; }
		if (this.checkForTieCondition())
			{ return 'tie'; }

		if (this.mode == 'two-player') {
			this.changePlayer();
		}
		else {
			this.aiPlay();
			// Check for victory/tie condition.
			if (this.checkForVictoryCondition())
				{ return MARK_O; }
			if (this.checkForTieCondition())
				{ return 'tie'; }
		}

		return 'continue';
	};

	TicTacToeBoard.prototype.checkForVictoryCondition = function() {
		var		xPoints, oPoints, i, j, currPlan;

		/**	EXPLANATION:
		 * Since conveniently we have mapped out every possible
		 * victory scenario, we can just run through the plans and
		 * compare them to the state of the board.
		 *
		 * If either "player" gets a victory score of 3, he wins.
		 **/

		for (i=0; i<lib.plans.length; i++) {
			/* For each plan, both "players" begin with 0 points
			 * toward victory, and their score is reset for each
			 * new plan we test against.
			 **/
			xPoints = oPoints = 0;

			currPlan = lib.plans[i];

			for (j=0; j<currPlan.length; j++) {
				// Skip squares that are empty in the plan.
				if (currPlan[j] == MARK_EMPTY) { continue; }

				/* If a square in this plan is unset on the
				 * board, it is impossible for this plan to
				 * have been fully executed, and a plan must be
				 * fully executed to award victory. That is the
				 * nature of tic-tac-toe.
				 *
				 * Therefore it is impossible for this plan to
				 * be used as a victory criterion if any of its
				 * required squares is unset on the board. Move
				 * on to trying to compare the board against the
				 * next plan, then.
				 **/
				if (this.squares[i] == MARK_EMPTY) { break; }

				// Award points.
				if (this.squares[i] == MARK_X)
					{ xPoints++; }
				else
					{ oPoints++; }

				/* Since both players cannot own a square at the
				 * same time, we can also assert that a
				 * successful victory test can only give ONE
				 * player 3 points, and the other player must
				 * have 0 points.
				 *
				 * I.e, if both players have more than 0 points,
				 * the plan cannot return victory for either of
				 * them since execution of a particular plan is
				 * exclusive.
				 **/
				if (xPoints > 0 && oPoints > 0) { break; }

				// Finally, check for victory.
				if (xPoints == 3 || oPoints == 3)
					{ return true; }
			}
		}

		return false;
	}

	TicTacToeBoard.prototype.checkForTieCondition = function() {
		return this.nEmpty === 0;
	}

	TicTacToeBoard.prototype.draw = function() {
		var		i, elems;

		/**	EXPLANATION:
		 * Go through the divs in the grid that this board instance was
		 * bound to, and fill them with blanks, Xs and Os that reflect
		 * the current state of the board.
		 **/
		elems = this.grid.getElementsByTagName('div');

		for (i=0; i<this.squares.length; i++) {
			elems[i].innerHTML = '<span class="cell-mark">' +
				this.squares[i] +
				'</span>';
		}
	}

	return lib;
})
