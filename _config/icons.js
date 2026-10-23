import { config, icon } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faInstagram, faMastodon, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Render at build time; keep the existing shortcode names and CSS sizing.
config.autoAddCss = false;
const brands = { github: faGithub, instagram: faInstagram, mastodon: faMastodon, "x-twitter": faXTwitter };
const solid = { envelope: faEnvelope };

export default function(eleventyConfig) {
  for (const [name, icons] of [["fortawesomeBrand", brands], ["fortawesomeSolid", solid]]) {
    eleventyConfig.addShortcode(name, (key, className = "") => {
      if (!icons[key]) throw new Error(`Unknown social icon: ${key}`);
      return icon(icons[key], { classes: className.split(/\s+/).filter(Boolean) }).html.join("");
    });
  }
}
