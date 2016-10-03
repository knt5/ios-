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

The tools generate JPEG, PNG and MP4 files.

The main configuration file is ```config/config.js```. Change the ```photo-library``` path before using the tools.

The ```photo-library``` directory has to have the following directories.

```
~/0/photo/photo-library/    <- The photo-library path at default
 |- config/    <- Extra configuration files
 |- master/    <- Master data of photos and videos
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

The ```copy-only.txt``` and ```exclude.txt``` files have just file list like the followings.

```
/path/to/master/a.jpg
/path/to/master/b.mp4
/path/to/master/c.png
```

Files in ```copy-only.txt``` will be just copied but not be resized. Files in ```exclude.txt``` will not be copied.

The ```special-jpg.txt``` is TSV and has 3 columns for:

```
1: The new size to be resized with ImageMagick.
2: JPEG quality (1-100)
3: The part of directory path has files to be convert. Size and quality settings are applied to the files in the matched directory.
```

Example of ```special-jpg.txt```:

```
50% 50	/a/
x1080	60	/b/
1440x1440	70	/c/
50%	80	/d/
```

The ```special-video.txt``` is TSV and has 3 columns for:

```
1: Options for ffmpeg
2: CRF for x264
3: The part of directory path has files to be convert. Settings are applied to the files in the matched directory.
```

Example of ```special-video.txt```:

```
-vf "scale=trunc(iw/2):trunc(ih/2):flags=lanczos"	28	/a/
	32	/b/
```

### Copy converted files to camera roll of iPhone

1. Install the iOS app "PhotoCopy" with Xcode. (```PhotoCopy/PhotoCopy.xcodeproj```)
1. Add photo and video files as "documents" to PhotoCopy with iTunes.
1. Open PhotoCopy and press "Copy to Photos" button.
