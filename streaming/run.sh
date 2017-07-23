#!/bin/bash
./image_to_stream.sh $1 | ./stream_to_hls.sh $2
