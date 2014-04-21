
all: Makefile js css

# Standard targets clean, depend.
clean: fonyphile js-clean css-clean
fonyphile:
	rm -f clean fonyphile

node-http-server: all
	@http-server

test: all

js: js-lint js-minify

js-lint: js/2048.js js/2048-main.js js/tic-tac-toe.js js/tic-tac-toe-main.js
	@jshint $?

js-minify: js/2048-main.min.js js/tic-tac-toe-main.min.js
js/2048-main.min.js: js/2048-main.js js/2048.js
	@r.js -o baseUrl=js name=2048-main out=js/2048-main.min.js
js/tic-tac-toe-main.min.js: js/tic-tac-toe.js js/tic-tac-toe-main.js
	@r.js -o baseUrl=js name=tic-tac-toe-main out=js/tic-tac-toe-main.min.js

js-clean:
	rm -f js/*.min.js

css: css-lint css-minify
css-lint:
css-minify:
css-clean:
