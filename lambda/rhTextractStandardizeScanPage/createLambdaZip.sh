#!/bin/bash

ZIP_FILE="rhTextractStandardizeScanPage.zip"

zip -r "$ZIP_FILE" . -x "$ZIP_FILE" -x "dist" -x "test-data" -x "test-scans"
