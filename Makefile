all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json src tests

test: jshint
	 mocha --recursive tests/

PHONY: node-modules test jshint
