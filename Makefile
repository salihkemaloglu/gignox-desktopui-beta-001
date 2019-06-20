# we need the go-ipfs binary
IPFS_VERSION := $(shell cat ./package.json | jq-win64 .ipfsVersion -r )
IPFS_BINARY_NAME ?= go-ipfs_${IPFS_VERSION}_${TARGET}-amd64${BINARY_EXT}
BINARY_URL ?= https://dist.ipfs.io/go-ipfs/${IPFS_VERSION}/${IPFS_BINARY_NAME}

# we need the fs-repo-migrations binary
REPO_MIGRATIONS_VERSION := $(shell cat ./package.json | jq-win64 .ipfsRepoMigrationsVersion -r )
REPO_MIGRATIONS_BINARY_NAME ?= fs-repo-migrations_${REPO_MIGRATIONS_VERSION}_${TARGET}-amd64${BINARY_EXT}
REPO_MIGRATIONS_BINARY_URL ?= https://dist.ipfs.io/fs-repo-migrations/${REPO_MIGRATIONS_VERSION}/${REPO_MIGRATIONS_BINARY_NAME}
NODE_ENV ?= development
TMP_DIR := $(shell mktemp -d)
YARN_EXTRA_ARGS ?= --prefer-offline

_VERSION := $(shell cat package.json | jq-win64 .version -r )
_CHANNEL := $(shell cat package.json | jq-win64 .version -r | sed 's/^.*-//g' )

GH_TOKEN ?=
SNAPCRAFT_TOKEN ?= 
SPA_VERSION ?= $(_CHANNEL).

ifeq ($(OS),Windows_NT)
	BINARY_EXT := .zip
	DECOMPRESSOR := unzip
	TARGET := windows
	BUILD_ARGS += --windows
else
	BINARY_EXT := .tar.gz
	DECOMPRESSOR := tar xf
	UNAME_S ?= $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		TARGET := linux
		BUILD_ARGS += --linux
	endif
	ifeq ($(UNAME_S),Darwin)
		TARGET := darwin
		BUILD_ARGS += --mac --x64
	endif
endif

_test_variables:
	@test -n "$(TARGET)" || (echo "Variable TARGET not set"; exit 1)
	@test -n "$(NODE_ENV)" || (echo "Variable TARGET not set"; exit 1)
	@test -n "$(IPFS_VERSION)" || (echo "Variable IPFS_VERSION not set"; exit 1)
	@test -n "$(BINARY_URL)" || (echo "Variable BINARY_URL not set"; exit 1)
	@test -n "$(REPO_MIGRATIONS_VERSION)" || (echo "Variable REPO_MIGRATIONS_VERSION not set"; exit 1)
	@test -n "$(REPO_MIGRATIONS_BINARY_URL)" || (echo "Variable REPO_MIGRATIONS_BINARY_URL not set"; exit 1)
	@test -n "$(DECOMPRESSOR)" || (echo "Variable DECOMPRESSOR not set"; exit 1)
	@test -n "$(BUILD_ARGS)" || (echo "Variable BUILD_ARGS not set"; exit 1)
.PHONY: _test_variables

clean:
	rm -rf .cache
	rm -rf build
	rm -rf go-ipfs
	rm -rf coverage
	rm -rf node_modules
	rm -rf repo
	rm -rf fs-repo-migrations
.PHONY: clean

# Deletes every sub-directory from build directory (like unpacked files)
purge_build_directory:
	find ./build/ -maxdepth 1 -mindepth 1 -type d -exec rm -rf '{}' \;
.PHONEY: purge_build_directory

# Yarn packages, tests and linting
dep:
	NODE_ENV=development yarn --link-duplicates --pure-lockfile ${YARN_EXTRA_ARGS}
.PHONY: dep
dependencies: dep 
.PHONEY: dependencies

run: dep
	test -s go-ipfs/ipfs || "$(MAKE)" prepare_ipfs_bin
	test -s fs-repo-migrations/fs-repo-migrations || "$(MAKE)" prepare_repo_migrations_bin
	rm -rf .cache
	yarn start
.PHONY: run

lint: dep
	yarn lint
.PHONY: lint

_test%:
	yarn test$*
.PHONY: _test

test: prepare_repo_migrations_bin prepare_ipfs_bin dep _test _test-integration
.PHONY: test

test_release: prepare_release test
.PHONY: test_release

test_ci: dep _test
.PHONY: test_ci

# Building the packages for multiple platforms
build_icons: dep
	./node_modules/.bin/icon-gen -i ./docs/logo.svg -o ./docs/ -m ico,icns -n ico=logo,icns=logo
.PHONY: build_icons

# uses electron-compile to build the app and ensures icons are there
_prepkg: dep _test_variables
	mkdir -p build
	cp ./docs/logo.icns ./build/
	cp ./docs/logo.ico ./build/
	NODE_ENV=${NODE_ENV} ./node_modules/.bin/electron-compile app
.PHONY: _prepkg

# This endpoints updatse package.json in order to make them realease ready!
prepare_release:
	cat package.json | sed "s/\"development\",$$/\"production\",/g" >> package.new.json
	mv package.new.json package.json
	cat package.json | sed "s/\"beta.orion.siderus.ipfs.rocks\",$$/\"${SPA_VERSION}orion.siderus.ipfs.rocks\",/g" >> package.new.json
	mv package.new.json package.json
	cat package.json | sed "s/\"9d407c14d888a212cf04c397a95acb7b\",$$/\"bcd802fa2e699f85cc19e1ff6079e3c7\",/g" >> package.new.json
	mv package.new.json package.json
.PHONY: prepare_release_values

prepare_binaries: prepare_ipfs_bin prepare_repo_migrations_bin
.PHONY: prepare_binaries

# Download the go-ipfs binary from the URL
prepare_ipfs_bin: _test_variables
	curl -o ./${IPFS_BINARY_NAME} ${BINARY_URL}
	rm -rf ./go-ipfs
	$(DECOMPRESSOR) ${IPFS_BINARY_NAME}
	rm ${IPFS_BINARY_NAME}
.PHONY: prepare_ipfs_bin

# Download the fs-repo-migrations binary from the URL
prepare_repo_migrations_bin: _test_variables
	curl -o ./${REPO_MIGRATIONS_BINARY_NAME} ${REPO_MIGRATIONS_BINARY_URL}
	rm -rf ./fs-repo-migrations
	$(DECOMPRESSOR) ${REPO_MIGRATIONS_BINARY_NAME}
	rm ${REPO_MIGRATIONS_BINARY_NAME}
.PHONY: prepare_repo_migrations_bin

build_unpacked: _test_variables prepare_binaries _prepkg
	./node_modules/.bin/build ${BUILD_ARGS} --dir
.PHONY: build_unpacked

build: _test_variables prepare_binaries _prepkg
	./node_modules/.bin/build ${BUILD_ARGS}
.PHONY: build

build_all: clean
	$(MAKE) build -e OS="Darwin" -e UNAME_S="Darwin"
	$(MAKE) build -e OS="Linux" -e UNAME_S="Linux"
	$(MAKE) build -e OS="Windows_NT"
.PHONY: build_all

release: _test_variables prepare_release prepare_binaries _prepkg
	./node_modules/.bin/build ${BUILD_ARGS} --publish always
.PHONY: release

release_all: clean
	$(MAKE) release -e OS="Darwin" -e UNAME_S="Darwin"
	$(MAKE) release -e OS="Linux" -e UNAME_S="Linux"
	$(MAKE) release -e OS="Windows_NT"
.PHONY: release_all

# Snapcraft publishing
snap_publish:
	@echo "$${SNAPCRAFT_TOKEN}" >> ${TMP_DIR}/snap.txt
	snapcraft login --with ${TMP_DIR}/snap.txt
	snapcraft push --release=stable ./build/Orion_*.snap
	rm ${TMP_DIR}/snap.txt
.PHONEY: snap_publish

docker_run:
	docker run -it --rm -v $$PWD:/app -w /app electronuserland/builder:wine
