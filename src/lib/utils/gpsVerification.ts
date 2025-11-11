/**
 * GPS Verification Utilities
 *
 * Provides functionality to verify that professionals are at the correct location
 * when checking in/out of bookings. Uses the Haversine formula to calculate
 * distance between GPS coordinates.
 */

/**
 * GPS coordinates
 */
export type GPSCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Result of GPS verification
 */
export type GPSVerificationResult = {
  verified: boolean;
  distance: number; // in meters
  maxDistance: number; // in meters
  reason?: string;
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(coord1: GPSCoordinates, coord2: GPSCoordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return Math.round(distance);
}

/**
 * Verify that current GPS coordinates are within acceptable distance of target location
 *
 * @param currentLocation - Professional's current GPS coordinates
 * @param targetLocation - Booking address GPS coordinates
 * @param maxDistanceMeters - Maximum acceptable distance (default: 150 meters)
 * @returns Verification result with distance and pass/fail status
 */
export function verifyGPSProximity(
  currentLocation: GPSCoordinates,
  targetLocation: GPSCoordinates,
  maxDistanceMeters = 150
): GPSVerificationResult {
  // Calculate distance between coordinates
  const distance = calculateDistance(currentLocation, targetLocation);

  // Check if within acceptable range
  if (distance <= maxDistanceMeters) {
    return {
      verified: true,
      distance,
      maxDistance: maxDistanceMeters,
    };
  }

  return {
    verified: false,
    distance,
    maxDistance: maxDistanceMeters,
    reason: `Distance of ${distance}m exceeds maximum allowed distance of ${maxDistanceMeters}m`,
  };
}

/**
 * Extract GPS coordinates from booking address object
 *
 * Booking addresses can be stored in various formats. This function attempts to
 * extract latitude/longitude from common address formats.
 */
export function extractCoordinatesFromAddress(address: unknown): GPSCoordinates | null {
  if (!address || typeof address !== "object") {
    return null;
  }

  // Try common field names
  const addressObj = address as Record<string, unknown>;

  // Format 1: Direct lat/lng or latitude/longitude fields
  if ("latitude" in addressObj && "longitude" in addressObj) {
    const lat = Number(addressObj.latitude);
    const lng = Number(addressObj.longitude);
    if (!(Number.isNaN(lat) || Number.isNaN(lng))) {
      return { latitude: lat, longitude: lng };
    }
  }

  if ("lat" in addressObj && "lng" in addressObj) {
    const lat = Number(addressObj.lat);
    const lng = Number(addressObj.lng);
    if (!(Number.isNaN(lat) || Number.isNaN(lng))) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Format 2: Nested location object
  if ("location" in addressObj && typeof addressObj.location === "object") {
    return extractCoordinatesFromAddress(addressObj.location);
  }

  // Format 3: Google Maps place format
  if ("geometry" in addressObj && typeof addressObj.geometry === "object") {
    const geometry = addressObj.geometry as Record<string, unknown>;
    if ("location" in geometry && typeof geometry.location === "object") {
      return extractCoordinatesFromAddress(geometry.location);
    }
  }

  return null;
}

/**
 * Verify GPS coordinates for check-in/check-out
 *
 * This is the main function to use in API routes. It extracts coordinates from
 * the booking address and verifies proximity.
 *
 * @param professionalLocation - Professional's current GPS coordinates
 * @param bookingAddress - Booking address object (may contain coordinates)
 * @param maxDistanceMeters - Maximum acceptable distance (default: 150 meters)
 * @returns Verification result
 */
export function verifyBookingLocation(
  professionalLocation: GPSCoordinates,
  bookingAddress: unknown,
  maxDistanceMeters = 150
): GPSVerificationResult {
  // Extract target coordinates from booking address
  const targetLocation = extractCoordinatesFromAddress(bookingAddress);

  // If we can't extract coordinates from address, we can't verify
  // In this case, we allow the check-in/out but log a warning
  if (!targetLocation) {
    return {
      verified: true, // Allow check-in/out even without verification
      distance: 0,
      maxDistance: maxDistanceMeters,
      reason: "Unable to extract GPS coordinates from booking address - verification skipped",
    };
  }

  // Verify proximity
  return verifyGPSProximity(professionalLocation, targetLocation, maxDistanceMeters);
}
