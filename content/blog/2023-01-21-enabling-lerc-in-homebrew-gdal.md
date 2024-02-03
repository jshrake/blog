---
title: Enabling LERC in Homebrew GDAL
description: 
date: 2023-01-21
tags:
  - homebrew
layout: layouts/post.njk
draft: true
---

**Update (2022-01-22)**: Once the following pull requests are merged, LERC will be enabled in Homebrew GDAL by default.

- [x] Add lerc formula: [homebrew/homebrew-core#121231](https://github.com/Homebrew/homebrew-core/pull/121231)
- [ ] Enable lerc in libtiff: [homebrew/homebrew-core#121300](https://github.com/Homebrew/homebrew-core/pull/121300)

After reading <https://kokoalberti.com/articles/geotiff-compression-optimization-guide/>, I wanted to test the results of LERC compression myself. Unfortunately, as of this writing, LERC is not enabled in the Homebrew version of GDAL. Here are the steps to enable it:

1. ~~Clone and build <https://github.com/Esri/lerc.git>~~ Skip to step 2

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
    index 4e20a84bb742f..85d78ba561061 100644
    --- a/Formula/libtiff.rb
    +++ b/Formula/libtiff.rb
    @@ -25,6 +25,7 @@ class Libtiff < Formula
    end
    
    depends_on "jpeg-turbo"
    +  depends_on "liblerc"
    depends_on "zstd"
    
    uses_from_macos "zlib"
    @@ -38,6 +39,8 @@ def install
        --disable-webp
        --with-jpeg-include-dir=#{Formula["jpeg-turbo"].opt_include}
        --with-jpeg-lib-dir=#{Formula["jpeg-turbo"].opt_lib}
    +      --with-lerc-include-dir=#{Formula["liblerc"].opt_include}
    +      --with-lerc-lib-dir=#{Formula["liblerc"].opt_lib}
        --without-x
        ]
        system "./configure", *args
    ```

    Copy the above diff and apply it:

    ```bash
    cd "$(brew --repository homebrew/core)"
    pbpaste | patch -p1
    brew reinstall --build-from-source libtiff
    git restore Formula/libtiff.rb
    ```

3. Your Homebrew installed `gdal` should now have LERC and LERC_ZSTD available as compression options:

    ```bash
    gdal_translate -of GTIFF -co COMPRESS=LERC -co MAX_Z_ERROR=1 input.tif output.tif
    ```
