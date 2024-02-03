---
title: Enabling E57 in Homebrew PDAL
description: 
date: 2023-01-24
tags:
  - homebrew
layout: layouts/post.njk
draft: true
---

**Update (2022-01-25)**: Once the following pull request is merged, the E57 plugin will be available in Homebrew PDAL by default.

- [ ] Add E57 plugin: [homebrew/homebrew-core#121301](https://github.com/Homebrew/homebrew-core/pull/121301)

If you use Homebrew PDAL to read and write E57 files, you'll see the following error:

> PDAL: Couldn't create writer stage of type 'writers.e57'.
> You probably have a version of PDAL that didn't come with a plugin you're trying to load.  Please see the FAQ at https://pdal.io/faq

You can enable E57 support by applying the below patch to the `pdal` formula and rebuilding.

```diff
diff --git a/Formula/pdal.rb b/Formula/pdal.rb
index 4387411006f30..eb1dba935012a 100644
--- a/Formula/pdal.rb
+++ b/Formula/pdal.rb
@@ -29,6 +29,7 @@ class Pdal < Formula

depends_on "cmake" => :build
depends_on "pkg-config" => :build
+  depends_on "xerces-c" => :build
depends_on "gdal"
depends_on "hdf5"
depends_on "laszip"
@@ -40,6 +41,7 @@ class Pdal < Formula
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
