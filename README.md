
# Kyan Tech Radar

[![Build Status](https://travis-ci.com/kyan/tech-radar.svg?branch=main)](https://travis-ci.com/kyan/tech-radar)

The Kyan Tech Radar, forked from [thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar).

## Development Environment

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](http://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/)

### Environment Variables

You can find some predefined environment variables in `.env.sample`.

### Setup

Clone the project from [https://github.com/kyan/tech-radar](https://github.com/kyan/tech-radar).

    make build setup

### Running Locally

    make serve
    open http://localhost:8080

### Updating packages

The `node_modules` are downloaded during the docker build, so to make a change to the dependencies you'll need to update the `package.json` and then rebuild the docker container:

    make build update

### Update

You should update your local environment whenever code is pulled from the remote.

    make build update

### Linting

The project uses [`standard`](https://standardjs.com/) for linting.

    make lint

Runs `standard` with a fix flag to automatically resolve issues where possible.

### Testing

The project has [`jasmine`](https://jasmine.github.io/) for testing.

    make test

Runs the full test suite.

### Data

The data is pulled from a google sheet.

If you need to work from a different sheet for development purposes, first make a copy of the sheet, then publish to the web, then update the `sheetUrl` variable in [`src/util/factory.js`](./src/util/factory.js).
