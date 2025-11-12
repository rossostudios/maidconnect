"use client";

/**
 * RadioGroup Component - Migrated to React Aria
 *
 * This component uses React Aria's useRadioGroup and useRadio hooks for accessible radio groups.
 * Maintains the same API as the previous Radix UI implementation.
 */

import { Circle } from "lucide-react";
import * as React from "react";
import type { AriaRadioGroupProps, AriaRadioProps } from "react-aria";
import { useRadio, useRadioGroup } from "react-aria";
import { useRadioGroupState } from "react-stately";

import { cn } from "@/lib/utils";

// Context to share radio group state
const RadioGroupContext = React.createContext<ReturnType<typeof useRadioGroupState> | null>(null);

interface RadioGroupProps extends AriaRadioGroupProps {
  className?: string;
  children: React.ReactNode;
}

const RadioGroup = ({
  className,
  children,
  ref,
  ...props
}: RadioGroupProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const state = useRadioGroupState(props);
  const radioGroupRef = React.useRef<HTMLDivElement>(null);
  const { radioGroupProps } = useRadioGroup(props, state);

  // Merge refs
  React.useImperativeHandle(ref, () => radioGroupRef.current as HTMLDivElement);

  return (
    <RadioGroupContext.Provider value={state}>
      <div className={cn("grid gap-2", className)} ref={radioGroupRef} {...radioGroupProps}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends AriaRadioProps {
  className?: string;
}

const RadioGroupItem = ({
  className,
  ref,
  ...props
}: RadioGroupItemProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  const state = React.useContext(RadioGroupContext);
  const radioRef = React.useRef<HTMLInputElement>(null);

  if (!state) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }

  const { inputProps } = useRadio(props, state, radioRef);

  // Merge refs
  React.useImperativeHandle(ref, () => radioRef.current as HTMLInputElement);

  const isSelected = state.selectedValue === props.value;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2",
        props.isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <input {...inputProps} className="sr-only" ref={radioRef} />
        {isSelected && (
          <div className="flex h-full w-full items-center justify-center">
            <Circle className="h-2.5 w-2.5 fill-current text-current" />
          </div>
        )}
      </div>
      {props.children}
    </label>
  );
};

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
