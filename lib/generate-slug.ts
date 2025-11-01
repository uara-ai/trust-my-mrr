/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extract domain from URL and convert to slug
 * Example: https://uara.ai -> uara-ai
 */
export function generateSlugFromUrl(url: string): string {
  try {
    // Remove protocol if present
    let domain = url.replace(/^https?:\/\//, "");

    // Remove trailing slash
    domain = domain.replace(/\/$/, "");

    // Remove www. prefix
    domain = domain.replace(/^www\./, "");

    // Remove path, query, and hash
    domain = domain.split("/")[0];
    domain = domain.split("?")[0];
    domain = domain.split("#")[0];

    // Replace dots with hyphens
    const slug = domain.replace(/\./g, "-");

    return slug.toLowerCase();
  } catch (error) {
    // If URL parsing fails, generate from text
    return generateSlug(url);
  }
}

/**
 * Generate a unique slug by appending a random string if needed
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Generate slug from website URL, with fallback to name
 * Example: https://uara.ai -> uara-ai
 */
export function generateSlugFromWebsiteOrName(
  website: string | undefined,
  name: string
): string {
  if (website && website !== "https://") {
    return generateSlugFromUrl(website);
  }

  // Fallback to name-based slug
  return generateUniqueSlug(name);
}
