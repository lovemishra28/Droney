export const localMediaFallback = "/images/altitude-hero-bg.jpg";

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return localMediaFallback;
  }

  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  // If mock wireframe placeholder
  if (lower.includes("drone-placeholder") || lower.includes("placeholder")) {
    return localMediaFallback;
  }

  // Model-specific photography matching
  if (lower.includes("air 3") || lower.includes("air-3") || lower.includes("a3s")) {
    return "/images/dji-air-3s.jpg";
  }
  if (lower.includes("mavic 3") || lower.includes("mavic-3") || lower.includes("m3p")) {
    return "/images/dji-mavic-3-pro.jpg";
  }
  if (lower.includes("avata") || lower.includes("fpv") || lower.includes("aerox") || lower.includes("emax")) {
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

  // Fallback for non-existent root paths like "/DJI Air 3S"
  return localMediaFallback;
}
