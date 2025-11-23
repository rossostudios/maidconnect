/**
 * Search Components - Airbnb-Inspired Flexible Search
 *
 * These components implement Airbnb's 2025 flexible search patterns:
 * - Category icon carousel (service type filtering)
 * - Featured professionals carousel
 * - Flexible destinations (explore by city)
 * - Reusable carousel base component
 *
 * @see https://news.airbnb.com/airbnb-2025-summer-release/
 */

export { CategoryCarousel } from "./CategoryCarousel";
export type { ServiceCategory } from "./CategoryCarousel";
export { FeaturedCarousel } from "./FeaturedCarousel";
export type { FeaturedProfessional } from "./FeaturedCarousel";
export { CarouselItem, FlexibleCarousel } from "./FlexibleCarousel";
export { FlexibleDestinations } from "./FlexibleDestinations";
export type { CityDestination } from "./FlexibleDestinations";
