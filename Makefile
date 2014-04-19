
all: Makefile js css

# Standard targets clean, depend.
clean: fonyphile js-clean css-clean
fonyphile:
	rm -f clean fonyphile

node-http-server: all
	@http-server

test: all

js: js-lint js-minify
js-lint: js/2048.js js/main.js
	@jshint $?

js-minify: js/main.js js/2048.js
	r.js -o baseUrl=js name=main out=js/main.min.js

js-clean:
	rm -f js/main.min.js

css: css-lint css-minify
css-lint:
css-minify:
css-clean:
