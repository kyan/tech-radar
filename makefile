.PHONY: build setup serve update lint test

help:
	@echo "How to use:"
	@echo
	@echo "  $$ make build    build the local docker infrastructure"
	@echo "  $$ make setup    setup environment after initial install"
	@echo "  $$ make serve    start the local development environment"
	@echo "  $$ make update   update environment after pulling changes"
	@echo "  $$ make lint     fix formatting and linting"
	@echo "  $$ make test     run the test suite"

build:
	docker-compose build

setup:

serve:
	docker-compose up

update:

lint:
	bin/docker/yarn run lint:fix

test:
	bin/docker/yarn run test
