#!/bin/bash

ZIP_FILE="getPresignedURL.zip"

zip -r "$ZIP_FILE" . -x "$ZIP_FILE"
