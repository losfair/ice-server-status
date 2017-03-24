#!/bin/bash
./image_to_stream.sh | ./stream_to_hls.sh $1
