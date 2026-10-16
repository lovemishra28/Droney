export const localMediaFallback = "/images/altitude-hero-bg.jpg";

export function resolveImageUrl(
  url: string | null | undefined,
  productName?: string
): string {
  const combined = `${url || ""} ${productName || ""}`.toLowerCase();

  // If mock wireframe placeholder or missing, match on combined name/sku/url
  if (
    !url ||
    typeof url !== "string" ||
    url.trim() === "" ||
    url.includes("placeholder")
  ) {
    if (
      combined.includes("mavic 4") ||
      combined.includes("m4p") ||
      combined.includes("mavic-4")
    ) {
      return "/images/dji-mavic-4-pro.webp";
    }
    if (combined.includes("air 3") || combined.includes("a3s")) {
      return "/images/dji-air-3s.jpg";
    }
    if (combined.includes("mavic 3") || combined.includes("m3p")) {
      return "/images/dji-mavic-3-pro.jpg";
    }
    if (
      combined.includes("avata") ||
      combined.includes("fpv") ||
      combined.includes("aerox")
    ) {
      return "/images/dji-avata-2.jpg";
    }
    if (combined.includes("neo")) {
      return "/images/dji-neo-palm.jpg";
    }
    if (combined.includes("mini") || combined.includes("pre-owned")) {
      return "/images/preowned-mini-canyon.jpg";
    }
    if (combined.includes("battery") || combined.includes("bat")) {
      return "/images/accessory-battery.jpg";
    }
    if (combined.includes("filter") || combined.includes("nd")) {
      return "/images/accessory-nd-filters.jpg";
    }
    if (combined.includes("case") || combined.includes("bag")) {
      return "/images/accessory-hard-case.jpg";
    }
    if (combined.includes("remote") || combined.includes("rc")) {
      return "/images/accessory-rc2-remote.jpg";
    }
    if (combined.includes("propeller") || combined.includes("prop")) {
      return "/images/diy-propellers.jpg";
    }
    if (combined.includes("motor") || combined.includes("xing")) {
      return "/images/diy-motor.jpg";
    }
    if (combined.includes("stack") || combined.includes("esc")) {
      return "/images/diy-flight-stack.jpg";
    }
    return localMediaFallback;
  }

  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  // Model-specific photography matching
  if (lower.includes("air 3") || lower.includes("air-3") || lower.includes("a3s")) {
    return "/images/dji-air-3s.jpg";
  }
  if (lower.includes("mavic 3") || lower.includes("mavic-3") || lower.includes("m3p")) {
    return "/images/dji-mavic-3-pro.jpg";
  }
  if (
    lower.includes("avata") ||
    lower.includes("fpv") ||
    lower.includes("aerox") ||
    lower.includes("emax")
  ) {
    return "/images/dji-avata-2.jpg";
  }
  if (lower.includes("neo")) {
    return "/images/dji-neo-palm.jpg";
  }
  if (lower.includes("mini") || lower.includes("pre-owned") || lower.includes("sh-")) {
    return "/images/preowned-mini-canyon.jpg";
  }

  // If it's already an existing asset in /images/
  if (cleanUrl.startsWith("/images/")) {
    return cleanUrl;
  }

  // If it's an external URL (http/https)
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // Fallback
  return localMediaFallback;
}

export function getProductCoverMedia(
  media?: { url: string; mediaType?: string; displayOrder?: number }[] | null,
  productName?: string
): string {
  if (!media || media.length === 0) {
    return resolveImageUrl(null, productName);
  }

  const imageMedia = media.filter(
    (m) => !m.mediaType || m.mediaType === "image"
  );
  if (imageMedia.length === 0) {
    return resolveImageUrl(null, productName);
  }

  // Sort by displayOrder ascending
  const sorted = [...imageMedia].sort(
    (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
  );

  // If a WebP image is available with low order, prioritize it for fast loading
  const webpMatch = sorted.find(
    (m) => (m.displayOrder ?? 999) <= 1 && m.url?.toLowerCase().endsWith(".webp")
  );

  const picked = webpMatch?.url || sorted[0]?.url;
  return resolveImageUrl(picked, productName);
}

