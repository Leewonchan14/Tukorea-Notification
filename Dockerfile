# 플랫폼 은 linux, selenium/standalone-chrome
FROM python:3.12-slim

RUN apt update
RUN apt install netcat-traditional
RUN apt install -y gcc python3-dev

WORKDIR /app
COPY requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

COPY entry.sh /entry.sh
RUN chmod +x /entry.sh

ENTRYPOINT ["/entry.sh"]

#CMD fastapi run
#CMD tail -f /dev/null
CMD python3 main.py