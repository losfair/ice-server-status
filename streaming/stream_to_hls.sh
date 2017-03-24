#!/bin/bash

ffmpeg -y -c:v png -f image2pipe -r 10 -i - -c:v libx264 -s 800x600 -pix_fmt yuv420p -f hls -hls_list_size 5 -hls_wrap 5 $1
