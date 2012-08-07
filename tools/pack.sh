#!/bin/bash

rm -rf ../thecollector-pack

cp -rf ../thecollector ../thecollector-pack

find ../thecollector-pack \
    -iregex '.*\.js$' -and -not -name '*min*' -and -not -name '*pack*' \
    -exec java -jar ./compiler-latest/compiler.jar --js '{}' --js_output_file '{}-compressed' \; \
    -exec mv -fv '{}-compressed' '{}' \;