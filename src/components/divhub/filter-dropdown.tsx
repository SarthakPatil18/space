import React, { useState, useRef, useEffect } from "react";
import { Filter, X, RotateCcw, ChevronDown } from "lucide-react";

export type ExamFilter = "all" | "mse" | "ese";
export type YearFilter = number | "all";

const DEFAULT_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

export function FilterDropdown({
  selectedExam,
  onExamChange,
  selectedYear,
  onYearChange,
  availableYears,
  color,
}: {
  selectedExam: ExamFilter;
  onExamChange: (exam: ExamFilter) => void;
  selectedYear: YearFilter;
  onYearChange: (year: YearFilter) => void;
  availableYears?: number[];
  color?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeColor = color || "#3B82F6";

  const years = availableYears && availableYears.length > 0 ? availableYears : DEFAULT_YEARS;
  const activeFiltersCount = (selectedExam !== "all" ? 1 : 0) + (selectedYear !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0;

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleReset() {
    onExamChange("all");
    onYearChange("all");
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Filter Button (Sits right beside Grid/List Toggle) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 py-1 text-xs sm:text-sm font-medium transition-all shadow-2xs backdrop-blur-xs cursor-pointer ${
          hasActiveFilters
            ? "border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs"
            : "border-hairline bg-card/90 text-ink hover:bg-hairline-soft"
        }`}
        style={
          hasActiveFilters
            ? {
                borderColor: `${activeColor}60`,
                backgroundColor: `${activeColor}12`,
                color: activeColor,
              }
            : undefined
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Filter by Exam and Year"
      >
        <Filter className="size-4 shrink-0" />
        <span>Filter</span>
        {hasActiveFilters ? (
          <span
            className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: activeColor }}
          >
            {activeFiltersCount}
          </span>
        ) : null}
        <ChevronDown
          className={`size-3.5 text-mute transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen ? (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl border border-hairline bg-card p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-1.5">
              <Filter className="size-4 text-primary" style={{ color: activeColor }} />
              <span className="text-sm font-semibold text-ink">Filter Material</span>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-semibold text-mute hover:text-ink transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-mute hover:text-ink transition-colors cursor-pointer"
                aria-label="Close filter menu"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-3.5 space-y-4">
            {/* Exam Filter Section */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-mute mb-2">
                Exam Type
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "all", label: "All Exams" },
                  { id: "mse", label: "MSE (Mid)" },
                  { id: "ese", label: "ESE (End)" },
                ].map((item) => {
                  const isSelected = selectedExam === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onExamChange(item.id as ExamFilter)}
                      className={`flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "text-white font-semibold shadow-xs"
                          : "border border-hairline bg-card hover:bg-hairline-soft text-ink"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: activeColor }
                          : undefined
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-mute">
                  Year
                </p>
                {selectedYear !== "all" ? (
                  <button
                    type="button"
                    onClick={() => onYearChange("all")}
                    className="text-[11px] text-primary hover:underline font-medium"
                    style={{ color: activeColor }}
                  >
                    Clear year
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                <button
                  type="button"
                  onClick={() => onYearChange("all")}
                  className={`flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    selectedYear === "all"
                      ? "text-white font-semibold shadow-xs"
                      : "border border-hairline bg-card hover:bg-hairline-soft text-ink"
                  }`}
                  style={
                    selectedYear === "all"
                      ? { backgroundColor: activeColor }
                      : undefined
                  }
                >
                  All
                </button>
                {years.map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => onYearChange(yr)}
                      className={`flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "text-white font-semibold shadow-xs"
                          : "border border-hairline bg-card hover:bg-hairline-soft text-ink"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: activeColor }
                          : undefined
                      }
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with Done button */}
          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
            <span className="text-xs text-mute">
              {hasActiveFilters ? `${activeFiltersCount} filter(s) active` : "No filters active"}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary-sm py-1 px-3 text-xs"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ActiveFilterChips({
  selectedExam,
  onExamClear,
  selectedYear,
  onYearClear,
  onResetAll,
  count,
  color,
}: {
  selectedExam: ExamFilter;
  onExamClear: () => void;
  selectedYear: YearFilter;
  onYearClear: () => void;
  onResetAll: () => void;
  count?: number;
  color?: string;
}) {
  const hasActive = selectedExam !== "all" || selectedYear !== "all";
  if (!hasActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
      <span className="text-mute font-medium">Filtered by:</span>

      {selectedExam !== "all" ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-hairline-soft/80 px-2.5 py-0.5 text-ink font-semibold">
          <span>Exam: {selectedExam.toUpperCase()}</span>
          <button
            type="button"
            onClick={onExamClear}
            className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
            aria-label="Remove exam filter"
          >
            <X className="size-3" />
          </button>
        </span>
      ) : null}

      {selectedYear !== "all" ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-hairline-soft/80 px-2.5 py-0.5 text-ink font-semibold">
          <span>Year: {selectedYear}</span>
          <button
            type="button"
            onClick={onYearClear}
            className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
            aria-label="Remove year filter"
          >
            <X className="size-3" />
          </button>
        </span>
      ) : null}

      {typeof count === "number" ? (
        <span className="text-mute">
          ({count} match{count === 1 ? "" : "es"})
        </span>
      ) : null}

      <button
        type="button"
        onClick={onResetAll}
        className="text-primary hover:underline font-semibold ml-auto cursor-pointer"
        style={color ? { color } : undefined}
      >
        Clear all
      </button>
    </div>
  );
}
