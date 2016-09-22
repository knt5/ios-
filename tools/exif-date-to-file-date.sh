#!/bin/bash

# Installation (Mac)
# brew install exiftool

exiftool -r '-DateTimeOriginal>FileModifyDate' .
