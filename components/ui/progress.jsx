"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}) {
  const percentage = value || 0;
  let indicatorColor = "bg-green-500"; // Default to green

  if (percentage >= 50 && percentage < 80) {
    indicatorColor = "bg-yellow-500";
  } else if (percentage >= 80) {
    indicatorColor = "bg-red-500";
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 transition-all", indicatorColor)}
        style={{ transform: `translateX(-${100 - percentage}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress };