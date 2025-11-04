import { useEffect, useRef } from "react";

type SwipeGestureOptions = {
  /**
   * Callback when user swipes left
   */
  onSwipeLeft?: () => void;
  /**
   * Callback when user swipes right
   */
  onSwipeRight?: () => void;
  /**
   * Minimum distance in pixels to trigger a swipe
   * @default 50
   */
  minSwipeDistance?: number;
  /**
   * Maximum time in ms for a swipe to be valid
   * @default 300
   */
  maxSwipeTime?: number;
};

/**
 * Hook to detect swipe gestures on touch devices
 * Enhances mobile UX for navigation and form interactions
 */
export function useSwipeGesture<T extends HTMLElement = HTMLDivElement>({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  maxSwipeTime = 300,
}: SwipeGestureOptions) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) {
        return;
      }

      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;

      // Check if swipe was fast enough
      if (deltaTime > maxSwipeTime) {
        return;
      }

      // Check if horizontal swipe is dominant (not vertical scroll)
      if (Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      // Check if swipe distance is sufficient
      if (Math.abs(deltaX) < minSwipeDistance) {
        return;
      }

      // Determine swipe direction
      if (deltaX > 0) {
        // Swipe right
        onSwipeRight?.();
      } else {
        // Swipe left
        onSwipeLeft?.();
      }
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance, maxSwipeTime]);

  return elementRef;
}
