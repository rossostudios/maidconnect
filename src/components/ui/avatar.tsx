"use client";

/**
 * Avatar Component (Custom Implementation)
 *
 * Simple avatar component with image loading and fallback support.
 * Migrated from Radix UI to custom implementation to reduce dependencies.
 *
 * Week 4: Component Libraries Consolidation - Task 1
 *
 * @example
 * ```tsx
 * // With image
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="John Doe" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 *
 * // Fallback only
 * <Avatar>
 *   <AvatarFallback>AB</AvatarFallback>
 * </Avatar>
 *
 * // Custom size
 * <Avatar className="h-16 w-16">
 *   <AvatarImage src="/user.jpg" alt="Jane Smith" />
 *   <AvatarFallback>JS</AvatarFallback>
 * </Avatar>
 * ```
 */

import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Avatar Context for sharing image load state
 */
type AvatarContextValue = {
  imageLoadingStatus: "idle" | "loading" | "loaded" | "error";
  onImageLoadingStatusChange: (status: "loading" | "loaded" | "error") => void;
};

const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoadingStatus: "idle",
  onImageLoadingStatusChange: () => {},
});

/**
 * Avatar Root Props
 * React 19: ref is a regular prop.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes for the avatar container
   */
  className?: string;
  /**
   * Children elements (typically AvatarImage and AvatarFallback)
   */
  children: React.ReactNode;
  /**
   * Ref to the avatar container element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Avatar Root Component
 *
 * Container for avatar with circular shape and overflow management.
 * Lia Design System: Uses rounded-full for perfect circles.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const Avatar = ({ className, children, ref, ...props }: AvatarProps) => {
  const [imageLoadingStatus, setImageLoadingStatus] =
    React.useState<AvatarContextValue["imageLoadingStatus"]>("idle");

  const handleImageLoadingStatusChange = React.useCallback(
    (status: "loading" | "loaded" | "error") => {
      setImageLoadingStatus(status);
    },
    []
  );

  return (
    <AvatarContext.Provider
      value={{
        imageLoadingStatus,
        onImageLoadingStatusChange: handleImageLoadingStatusChange,
      }}
    >
      <div
        className={cn(
          // Base layout
          "relative flex shrink-0",
          // Size (default: 40px x 40px)
          "h-10 w-10",
          // Shape - Lia Design System: rounded-full for avatars
          "rounded-full",
          // Overflow control
          "overflow-hidden",
          // Additional classes
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
};

/**
 * Avatar Image Props
 * React 19: ref is a regular prop.
 */
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image source URL
   */
  src: string;
  /**
   * Alt text for accessibility
   */
  alt: string;
  /**
   * Additional CSS classes for the image
   */
  className?: string;
  /**
   * Ref to the image element
   */
  ref?: React.RefObject<HTMLImageElement | null>;
}

/**
 * Avatar Image Component
 *
 * Renders the avatar image with automatic loading state management.
 * Falls back to AvatarFallback on load error.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const AvatarImage = ({ className, src, alt, ref, ...props }: AvatarImageProps) => {
  const { imageLoadingStatus, onImageLoadingStatusChange } = React.useContext(AvatarContext);

  // Handle image load success
  const handleLoad = React.useCallback(() => {
    onImageLoadingStatusChange("loaded");
  }, [onImageLoadingStatusChange]);

  // Handle image load error
  const handleError = React.useCallback(() => {
    onImageLoadingStatusChange("error");
  }, [onImageLoadingStatusChange]);

  // Set loading state when src changes
  React.useEffect(() => {
    if (src) {
      onImageLoadingStatusChange("loading");
    }
  }, [src, onImageLoadingStatusChange]);

  // Don't render if image failed to load or hasn't started loading
  if (imageLoadingStatus === "error" || imageLoadingStatus === "idle") {
    return null;
  }

  return (
    <img
      alt={alt}
      className={cn(
        // Full size to match container
        "aspect-square h-full w-full",
        // Object fit
        "object-cover",
        // Additional classes
        className
      )}
      onError={handleError}
      onLoad={handleLoad}
      ref={ref}
      src={src}
      {...props}
    />
  );
};

/**
 * Avatar Fallback Props
 * React 19: ref is a regular prop.
 */
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes for the fallback container
   */
  className?: string;
  /**
   * Fallback content (typically initials)
   */
  children: React.ReactNode;
  /**
   * Ref to the fallback element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Avatar Fallback Component
 *
 * Displays fallback content when image is unavailable or loading.
 * Typically used for user initials.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const AvatarFallback = ({ className, children, ref, ...props }: AvatarFallbackProps) => {
  const { imageLoadingStatus } = React.useContext(AvatarContext);

  // Only show fallback if image hasn't loaded or errored
  if (imageLoadingStatus === "loaded") {
    return null;
  }

  return (
    <div
      className={cn(
        // Full size to match container
        "flex h-full w-full",
        // Center content
        "items-center justify-center",
        // Background (Lia Design System - neutral background)
        "bg-neutral-100",
        // Text styling
        "font-medium text-neutral-700 text-sm",
        // Additional classes
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
};
