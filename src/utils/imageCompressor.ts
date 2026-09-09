/**
 * Client-side image compression and resizing utility.
 * Optimizes high-resolution camera photos / screenshots into high-fidelity,
 * bandwidth-efficient JPEG/WebP base64 payloads prior to network transit.
 */
export async function compressAndResizeImage(
  fileOrBase64: File | string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = "";
    let shouldRevoke = false;

    if (typeof fileOrBase64 === "string") {
      srcUrl = fileOrBase64;
    } else if (typeof Blob !== "undefined" && fileOrBase64 instanceof Blob) {
      srcUrl = URL.createObjectURL(fileOrBase64);
      shouldRevoke = true;
    } else {
      return reject(new Error("Invalid image format provided for compression"));
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          // Fallback to original string if 2D canvas context unavailable
          return resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
        }

        // High quality bicubic resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG/WebP
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        resolve(compressedBase64);
      } catch (err) {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        // On error, fallback to raw input if string
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      }
    };

    img.onerror = (err) => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      reject(new Error("Failed to load image for compression: " + String(err)));
    };

    img.src = srcUrl;
  });
}
