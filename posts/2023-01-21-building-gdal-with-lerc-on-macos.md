---
title: Homebrew GDAL + LERC
description: 
date: 2023-01-21
tags:
  - geospatial
  - gdal
  - homebrew
layout: layouts/post.njk
draft: false
---

After reading <https://kokoalberti.com/articles/geotiff-compression-optimization-guide/>, I wanted to test LERC compression myself. Unfortunately, as of this writing, it's not available in the homebrew installed GDAL. The following steps will show you how to add LERC support to the homebrew installed GDAL:

1. Clone and build <https://github.com/Esri/lerc.git>

    ```bash
    cd /Users/justin/code
    git clone https://github.com/Esri/lerc.git
    cd lerc
    cmake -S. -Bbuild -DCMAKE_BUILD_TYPE=Release
    cmake --build build
    ```

2. Edit the homebrew `libtiff` formula with the following patch:

    ```diff
    diff --git a/Formula/libtiff.rb b/Formula/libtiff.rb
    index 4e20a84bb74..2ec59f64314 100644
    --- a/Formula/libtiff.rb
    +++ b/Formula/libtiff.rb
    @@ -33,7 +33,9 @@ class Libtiff < Formula
        args = %W[
        --prefix=#{prefix}
        --enable-zstd
    +   --enable-lerc
    +   --with-lerc-include-dir=/Users/justin/code/lerc/src/LercLib/include
    +   --with-lerc-lib-dir=/Users/justin/code/lerc/build
        --disable-lzma
        --disable-webp
        --with-jpeg-include-dir=#{Formula["jpeg-turbo"].opt_include}
    ```

    Replace the paths `with-lerc-include-dir` and `with-lerc-lib-dir` with the path you cloned above.
    Then, copy the patch and apply it:

    ```bash
    cd "$(brew --repository homebrew/core)"
    pbpaste | patch -p1
    brew reinstall --build-from-source libtiff
    git restore Formula/libtiff.rb
    ```

3. Your homebrew installed `gdal` should now have the LERC codec available:

    ```bash
    gdal_translate -of GTIFF -co COMPRESS=LERC -co MAX_Z_ERROR=1 input.tif output.tif
    ```
