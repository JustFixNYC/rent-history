#!/bin/bash

ZIP_FILE="../rhTextractStandardizeScanPage.zip"

rm "$ZIP_FILE"
zip -r "$ZIP_FILE" * 
