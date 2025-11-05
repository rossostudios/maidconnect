"use client";

import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { TourStep } from "@/hooks/use-onboarding-tour";

type TourTooltipProps = {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
};

export function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  progress,
  onNext,
  onPrevious,
  onSkip,
  onClose,
}: TourTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.querySelector(step.target);

    if (!(targetElement && tooltipRef.current)) {
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();

      if (!tooltipRect) {
        return;
      }

      let top = 0;
      let left = 0;

      const placement = step.placement || "bottom";
      const offset = 16; // px spacing from target

      switch (placement) {
        case "top":
          top = rect.top - tooltipRect.height - offset;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + offset;
          break;
      }

      // Keep within viewport
      const padding = 16;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setPosition({ top, left });
      setIsVisible(true);
    };

    // Scroll target into view
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Wait for scroll to complete
    setTimeout(() => {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
    }, 500);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [step]);

  // Highlight target element
  useEffect(() => {
    const targetElement = document.querySelector(step.target);

    if (!targetElement) {
      return; // No cleanup needed if element doesn't exist
    }

    const originalOutline = (targetElement as HTMLElement).style.outline;
    const originalZIndex = (targetElement as HTMLElement).style.zIndex;
    const originalPosition = (targetElement as HTMLElement).style.position;

    // Highlight target
    (targetElement as HTMLElement).style.outline = "2px solid var(--red)";
    (targetElement as HTMLElement).style.outlineOffset = "4px";
    (targetElement as HTMLElement).style.zIndex = "9998";

    if (window.getComputedStyle(targetElement).position === "static") {
      (targetElement as HTMLElement).style.position = "relative";
    }

    return () => {
      (targetElement as HTMLElement).style.outline = originalOutline;
      (targetElement as HTMLElement).style.zIndex = originalZIndex;
      (targetElement as HTMLElement).style.position = originalPosition;
    };
  }, [step.target]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Tooltip */}
      <div
        className={`fixed z-[9999] w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-2xl transition-opacity ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        ref={tooltipRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          onClick={onClose}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
        </button>

        {/* Progress bar */}
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-[var(--red)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="mb-2 font-semibold text-gray-900 text-lg">{step.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            {currentStepIndex + 1} of {totalSteps}
          </div>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-50"
                onClick={onPrevious}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                Back
              </button>
            )}

            {isFirstStep && (
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-50"
                onClick={onSkip}
                type="button"
              >
                Skip Tour
              </button>
            )}

            <button
              className="flex items-center gap-1 rounded-lg bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[var(--red)]"
              onClick={onNext}
              type="button"
            >
              {isLastStep ? "Finish" : "Next"}
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
