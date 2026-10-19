"use client";

import {
  IGRPButton,
  IGRPPopoverContentPrimitive,
  IGRPPopoverPrimitive,
  IGRPPopoverTriggerPrimitive,
} from "@igrp/igrp-framework-react-design-system";
import { type ReactNode, useState } from "react";

type FiltersSectionProps = {
  children: ReactNode;
  hasAppliedFilters?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  title?: string;
};

export function FiltersSection({
  children,
  hasAppliedFilters = false,
  onApply,
  onClear,
  title = "Filtros",
}: FiltersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <IGRPPopoverPrimitive open={isOpen} onOpenChange={setIsOpen}>
        <IGRPPopoverTriggerPrimitive asChild>
          <IGRPButton variant={hasAppliedFilters ? "default" : "outline"} showIcon iconName="Funnel">
            {title}
          </IGRPButton>
        </IGRPPopoverTriggerPrimitive>
        <IGRPPopoverContentPrimitive
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="flex h-[min(42rem,var(--radix-popover-content-available-height))] w-[min(48rem,calc(100vw-2rem))] flex-col overflow-hidden p-0"
        >
          <div className="shrink-0 flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">{title}</h3>
            <IGRPButton
              variant="ghost"
              size="icon"
              showIcon
              iconName="X"
              aria-label="Fechar filtros"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          <div className="shrink-0 flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-between">
            <IGRPButton
              variant="outline"
              onClick={() => {
                onClear?.();
                setIsOpen(false);
              }}
            >
              Limpar filtros
            </IGRPButton>
            <IGRPButton
              onClick={() => {
                onApply?.();
                setIsOpen(false);
              }}
            >
              Mostrar resultados
            </IGRPButton>
          </div>
        </IGRPPopoverContentPrimitive>
      </IGRPPopoverPrimitive>
    </div>
  );
}
