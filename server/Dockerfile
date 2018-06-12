FROM tiangolo/uwsgi-nginx-flask:python3.6

LABEL maintainer=siku2@swiss-voice.ch

RUN apt-get update
RUN apt-get install ffmpeg=7:3.2.10 -y --no-install-recommends
RUN rm /var/lib/apt/lists/*

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

COPY ./swissvoice /app/swissvoice
COPY ./.docker/uwsgi.ini /app/
COPY ./.docker/_swissvoice.conf /etc/nginx/conf.d/
COPY ./.docker/config.cfg /app/

ENV SWISSVOICE_SETTINGS /app/config.cfg