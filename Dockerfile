FROM node:12

ENV APP_HOME /app
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
RUN yarn install

COPY . /app
