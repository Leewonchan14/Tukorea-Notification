#!/bin/bash

echo "Selenium Grid를 기다립니다."
while ! nc -z selenium 4444; do
  sleep 1
done
echo -e "\nSelenium Grid가 준비되었습니다.\n\n"

exec "$@"