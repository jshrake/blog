import path from "node:path";

export default {
  tags: ["posts"],
  layout: "layouts/post.njk",
  // Keep existing post URLs even though upstream moved the source directory.
  permalink: data => `/posts/${path.parse(data.page.inputPath).name}/`,
};
