#!/bin/bash

ZIP_FILE="rhDeleteScans.zip"

(cd "src" && zip -r "../$ZIP_FILE" ./*)
