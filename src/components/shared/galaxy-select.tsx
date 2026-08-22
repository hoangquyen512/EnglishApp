import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface GalaxySelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface GalaxySelectProps<T extends string> {
  id?: string;
  value: T;
  options: GalaxySelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

export function GalaxySelect<T extends string>({
  id,
  value,
  options,
  onChange,
  className = "",
  "aria-label": ariaLabel,
}: GalaxySelectProps<T>) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const listId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((item) => item.value === value),
    ),
  );

  const selected = options.find((item) => item.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((item) => item.value === value),
      ),
    );
  }, [open, options, value]);

  const selectAt = (index: number) => {
    const next = options[index];
    if (!next) {
      return;
    }
    onChange(next.value);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(options.length - 1, current + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectAt(activeIndex);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={`yume-galaxy-select ${className}`.trim()}>
      <button
        type="button"
        id={triggerId}
        className={`yume-lp__input yume-galaxy-select__trigger${open ? " yume-galaxy-on" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{selected?.label ?? value}</span>
        <span className="yume-galaxy-select__chevron" aria-hidden />
      </button>

      {open ? (
        <ul
          id={listId}
          className="yume-galaxy-select__menu"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={triggerId}
          aria-activedescendant={`${listId}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
        >
          {options.map((item, index) => {
            const selectedOption = item.value === value;
            const active = index === activeIndex;
            return (
              <li key={item.value} role="presentation">
                <button
                  type="button"
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={selectedOption}
                  className={`yume-galaxy-select__option${selectedOption ? " yume-galaxy-on" : ""}${
                    active ? " is-active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectAt(index)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
