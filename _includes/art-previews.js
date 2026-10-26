const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

for (const card of document.querySelectorAll(".art-grid-item[data-gif]")) {
  let animation;

  function stopPreview() {
    if (!animation) return;
    animation.onload = null;
    animation.onerror = null;
    animation.removeAttribute("src");
    animation.remove();
    animation = undefined;
  }

  card.addEventListener("pointerenter", event => {
    if (event.pointerType === "touch" || reducedMotion.matches || animation) return;

    // A data attribute never requests the GIF. Create its image only on hover,
    // and keep the still visible until the download succeeds.
    const image = new Image();
    animation = image;
    image.className = "art-grid-animation";
    image.alt = "";
    image.decoding = "async";
    image.onload = () => {
      if (animation === image) card.append(image);
    };
    image.onerror = stopPreview;
    image.src = card.dataset.gif;
  });

  card.addEventListener("pointerleave", stopPreview);
  card.addEventListener("pointercancel", stopPreview);
  reducedMotion.addEventListener("change", stopPreview);
}
