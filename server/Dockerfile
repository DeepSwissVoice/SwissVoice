FROM tiangolo/uwsgi-nginx-flask:python3.6

LABEL maintainer=siku2@swiss-voice.ch

VOLUME /app/swissvoice/static

# Prerequisites
RUN apt-get update
RUN apt-get install ffmpeg=7:3.2.10-1~deb9u1 -y --no-install-recommends

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

# Cleanup
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Installing
COPY ./swissvoice /app/swissvoice
COPY ./.docker/uwsgi.ini /app/
COPY ./.docker/_swissvoice.conf /etc/nginx/conf.d/