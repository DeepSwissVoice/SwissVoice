FROM tiangolo/uwsgi-nginx-flask:python3.6

COPY ./swissvoice /app/swissvoice
COPY ./.docker/uwsgi.ini /app/
COPY ./.docker/_swissvoice.conf /etc/nginx/conf.d/
COPY ./.docker/config.cfg /app/

ENV SWISSVOICE_SETTINGS /app/config.cfg

COPY ./requirements.txt ./
RUN pip install -r requirements.txt