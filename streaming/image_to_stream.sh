#!/bin/bash

while true
do
    curl http://$1/image 2> /dev/null
    sleep 0.1
done
