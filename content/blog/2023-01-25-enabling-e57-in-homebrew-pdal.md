---
title: Enabling E57 in Homebrew PDAL
description: 
date: 2023-01-24
tags:
  - geospatial
  - pdal
  - homebrew
layout: layouts/post.njk
draft: false
---

**Update (2022-01-25)**: Once the following pull request is merged, the E57 plugin will be available in Homebrew PDAL by default.

- [ ] Add E57 plugin: [homebrew/homebrew-core#121301](https://github.com/Homebrew/homebrew-core/pull/121301)

Perform the following steps to enable the E57 reader and writer plugins in Homebrew PDAL:

1. Edit the homebrew `pdal` formula with the following patch:

    ```diff
    diff --git a/Formula/pdal.rb b/Formula/pdal.rb
    index 4387411006f30..5c9f410ef2087 100644
    --- a/Formula/pdal.rb
    +++ b/Formula/pdal.rb
    @@ -34,12 +34,14 @@ class Pdal < Formula
    depends_on "laszip"
    depends_on "libpq"
    depends_on "numpy"
    +  depends_on "xerces-c"
    
    fails_with gcc: "5" # gdal is compiled with GCC
    
    def install
        system "cmake", ".", *std_cmake_args,
                            "-DWITH_LASZIP=TRUE",
    +                         "-DBUILD_PLUGIN_E57=ON",
                            "-DBUILD_PLUGIN_GREYHOUND=ON",
                            "-DBUILD_PLUGIN_ICEBRIDGE=ON",
                            "-DBUILD_PLUGIN_PGPOINTCLOUD=ON",
    ```

    Copy the above diff and apply it:

    ```bash
    cd "$(brew --repository homebrew/core)"
    pbpaste | patch -p1
    brew reinstall --build-from-source pdal
    git restore Formula/pdal.rb
    ```

2. Your Homebrew installed `pdal` should now have the E57 plugin available
