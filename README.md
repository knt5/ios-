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

The main configuration file is ```config/config.js```. Change the ```photo-library``` path before using the tools.

The ```photo-library``` directory has to have the following directories at default.

```
~/0/photo/photo-library/
 |- config/    <- Extra configuration files
 |- master/    <- Photos and videos master data
```

And the tools make ```Photos``` directory and save all photos and videos to it.

```
~/0/photo/photo-library/
 |- config/
 |- master/
 |- Photos/    <- Output directory
```

Extra configuration files:

```
~/0/photo/photo-library/
 |- config/
     |- copy-only.txt
     |- exclude.txt
     |- special-jpg.txt
     |- special-video.txt
```

The ```copy-only.txt``` and ```exclude.txt``` files have just file list like the followings. Files in ```copy-only.txt``` will be copied but not be resized. Files in ```exclude.txt``` will not be copied.

```
/path/to/master/a.jpg
/path/to/master/b.mp4
/path/to/master/c.png
```

The ```special-jpg.txt``` is TSV and has 3 columns for:

```
1: The new size to be resized with ImageMagick. ()
2: JPEG quality (1-100)
3: 
```

