#/*******************************************************************************
# *
# * This file is part of the {{displayname}} plugin for Kopano WebApp
# *
# * (c) 2019 {{author}}
# *
# * This file was automatically generated with @kopanowebapp/gulpfile-plugin
# * See https://stash.kopano.io/scm/~rtoussaint/kopanowebapp-npm.git for more information.
# *
# *******************************************************************************/


NPM = npm

SRC = src
JSRCS = $(shell find $(SRC)/js -type f)
PHPSRCS = $(shell find $(SRC)/php -type f)
RESOURCES = $(shell find $(SRC)/resources -type f)

.PHONY: all
all: dist

.PHONY: dist
dist: $(JSRCS) $(PHPSRCS) $(RESOURCES) node_modules
	$(NPM) run kwp:dist

.PHONY: watch
watch:
	$(NPM) run kwp:watch

.PHONY: deploy
deploy: dist
	rm -rf ../../deploy/plugins/filesbackendSeafile
	#cp -avR . ../../deploy/plugins/filesbackendSeafile
	rsync \
		-avr \
		--exclude=node_modules \
		--exclude=src \
		--exclude=.* \
		--exclude=gulpfile.js \
		--exclude=Makefile \
		--exclude=package* \
		. ../../deploy/plugins/filesbackendSeafile

node_modules:
	$(NPM) install

# target to print variables
# example:
#   make print-JSSRCS
print-%  :
	@echo $* = $($*)
