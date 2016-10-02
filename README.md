# Tools to reduce the size of photos and videos for iPhone

## Installation

```
# Xcode command line tools
sudo xcode-select --install

# ImageMagick
brew install imagemagick

# FFmpeg
brew install ffmpeg
```

## Usage

### Convert photos and videos for iPhone

This tools generate JPEG, PNG and MP4 files. (No MOV)

```
# Make file list
node 10-make-file-list.js

# Resize photos
20-resize-photos.js

# Resize videos
30-resize-videos.js

# Copy PNG files
40-copy-png.js
```

The main configuration file is ```config/config.js```. Change the ```photo-library``` path.

The ```photo-library``` directory has to have the following directories at default.

```
~/0/photo/photo-library/
 |- config/
 |- master/
```

Extra configuration files (default):

```
~/0/photo/photo-library/
```
