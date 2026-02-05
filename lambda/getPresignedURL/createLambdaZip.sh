#!/bin/bash

ZIP_FILE="getPresignedURL.zip"

(cd "src" && zip -r "../$ZIP_FILE" ./*)
