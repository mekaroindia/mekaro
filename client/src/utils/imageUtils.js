/**
 * Utility functions for handling image URLs across local development and production environments.
 */

export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // In production on mekaro.in or vercel:
    return "https://mekaro-backend.onrender.com";
  }
  return "https://mekaro-backend.onrender.com";
};

/**
 * Resolves any image URL (relative path, local public asset, Cloudinary, or backend URL)
 * into a valid, secure absolute or public URL.
 * 
 * @param {string} imagePath - The image path or URL from backend/state
 * @returns {string|null} Resolved image URL or null
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;

  // Static core team assets located in client/public
  if (trimmed.startsWith("/media/Coreteam/") || trimmed.startsWith("media/Coreteam/")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // Cloudinary URLs
  if (trimmed.includes("cloudinary.com")) {
    // Ensure HTTPS to avoid mixed content blocking
    return trimmed.replace(/^http:\/\//i, "https://");
  }

  // Already absolute http/https URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it points to localhost:8000 but the current frontend is in production
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      if (trimmed.includes("localhost:8000") || trimmed.includes("127.0.0.1:8000")) {
        const pathPart = trimmed.split(/:\d+/)[1] || "";
        return `${getApiBaseUrl()}${pathPart.startsWith("/") ? "" : "/"}${pathPart}`;
      }
    }
    // Upgrade insecure HTTP to HTTPS on production pages to prevent mixed content blocking
    if (typeof window !== "undefined" && window.location.protocol === "https:" && trimmed.startsWith("http://") && !trimmed.includes("localhost") && !trimmed.includes("127.0.0.1")) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    return trimmed;
  }

  // Relative backend paths (e.g. "/media/staff/photo.jpg", "staff/photo.jpg", "media/products/...")
  const baseUrl = getApiBaseUrl();
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
};
