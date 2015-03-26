#!/usr/bin/env bash

set -e

for f in *.js
do
  java -jar compiler.jar --js_output_file=min/$f $f
done

