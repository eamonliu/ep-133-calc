import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Operator = "add" | "subtract" | "multiply" | "divide";
type DisplayMode = "STD" | "SCI" | "CONV" | "MATH";

type KeyItem =
  | {
      kind: "action";
      label: string;
      ariaLabel: string;
      action: () => void;
      variant: "default" | "function" | "secondary";
      className?: string;
      icon?: ReactNode;
      metaLabel: string;
      activeLed?: boolean;
    }
  | {
      kind: "operator";
      label: string;
      ariaLabel: string;
      operator: Operator;
      className?: string;
      metaLabel: string;
      activeLed?: boolean;
    }
  | {
      kind: "digit";
      label: string;
      ariaLabel: string;
      value: string;
      className?: string;
      metaLabel: string;
      activeLed?: boolean;
    };

const MAX_INPUT_LENGTH = 12;

const operatorSymbol: Record<Operator, string> = {
  add: "+",
  subtract: "-",
  multiply: "×",
  divide: "÷",
};

function calculate(firstValue: number, secondValue: number, operator: Operator) {
  switch (operator) {
    case "add":
      return firstValue + secondValue;
    case "subtract":
      return firstValue - secondValue;
    case "multiply":
      return firstValue * secondValue;
    case "divide":
      return secondValue === 0 ? NaN : firstValue / secondValue;
  }
}

function normalizeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const rounded = Number.parseFloat(value.toPrecision(12));

  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-8)) {
    return rounded.toExponential(6).replace("+", "");
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 10,
    useGrouping: false,
  }).format(rounded);
}

function expressionNumber(value: string) {
  return value === "Error" ? "Error" : value;
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("STD");

  const hasError = display === "Error";

  const reset = useCallback(() => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression("");
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      if (hasError) {
        setDisplay(digit);
        setStoredValue(null);
        setOperator(null);
        setExpression("");
        setWaitingForOperand(false);
        return;
      }

      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
        return;
      }

      setDisplay((current) => {
        if (current.replace("-", "").replace(".", "").length >= MAX_INPUT_LENGTH) {
          return current;
        }

        return current === "0" ? digit : `${current}${digit}`;
      });
    },
    [hasError, waitingForOperand],
  );

  const inputDecimal = useCallback(() => {
    if (hasError) {
      setDisplay("0.");
      setStoredValue(null);
      setOperator(null);
      setExpression("");
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }

    setDisplay((current) => (current.includes(".") ? current : `${current}.`));
  }, [hasError, waitingForOperand]);

  const backspace = useCallback(() => {
    if (hasError || waitingForOperand) {
      setDisplay("0");
      setStoredValue(null);
      setOperator(null);
      setExpression("");
      setWaitingForOperand(false);
      return;
    }

    setDisplay((current) => {
      if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
        return "0";
      }

      return current.slice(0, -1);
    });
  }, [hasError, waitingForOperand]);

  const toggleSign = useCallback(() => {
    if (hasError || display === "0") {
      return;
    }

    setDisplay((current) => (current.startsWith("-") ? current.slice(1) : `-${current}`));
  }, [display, hasError]);

  const applyPercent = useCallback(() => {
    if (hasError) {
      return;
    }

    const nextValue = normalizeNumber(Number(display) / 100);
    setDisplay(nextValue);
    setWaitingForOperand(false);
  }, [display, hasError]);

  const chooseOperator = useCallback(
    (nextOperator: Operator) => {
      if (hasError) {
        return;
      }

      const inputValue = Number(display);

      if (storedValue === null) {
        setStoredValue(inputValue);
        setExpression(`${expressionNumber(display)} ${operatorSymbol[nextOperator]}`);
      } else if (operator && waitingForOperand) {
        setExpression(`${normalizeNumber(storedValue)} ${operatorSymbol[nextOperator]}`);
      } else if (operator) {
        const result = calculate(storedValue, inputValue, operator);
        const nextDisplay = normalizeNumber(result);

        setDisplay(nextDisplay);
        if (nextDisplay === "Error") {
          setStoredValue(null);
          setOperator(null);
          setExpression("");
          setWaitingForOperand(true);
          return;
        }

        setStoredValue(Number(nextDisplay));
        setExpression(`${expressionNumber(nextDisplay)} ${operatorSymbol[nextOperator]}`);
      }

      setOperator(nextOperator);
      setWaitingForOperand(true);
    },
    [display, hasError, operator, storedValue, waitingForOperand],
  );

  const performEquals = useCallback(() => {
    if (hasError || storedValue === null || operator === null) {
      return;
    }

    const inputValue = Number(display);
    const result = calculate(storedValue, inputValue, operator);
    const nextDisplay = normalizeNumber(result);

    setDisplay(nextDisplay);
    setExpression(
      `${normalizeNumber(storedValue)} ${operatorSymbol[operator]} ${expressionNumber(display)} =`,
    );
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, hasError, operator, storedValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const { key } = event;

      if (/^\d$/.test(key)) {
        event.preventDefault();
        inputDigit(key);
        return;
      }

      if (key === ".") {
        event.preventDefault();
        inputDecimal();
        return;
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        performEquals();
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }

      if (key === "Escape" || key === "Delete") {
        event.preventDefault();
        reset();
        return;
      }

      if (key === "%") {
        event.preventDefault();
        applyPercent();
        return;
      }

      const operatorFromKey: Record<string, Operator> = {
        "+": "add",
        "-": "subtract",
        "*": "multiply",
        x: "multiply",
        X: "multiply",
        "/": "divide",
      };

      if (operatorFromKey[key]) {
        event.preventDefault();
        chooseOperator(operatorFromKey[key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyPercent, backspace, chooseOperator, inputDecimal, inputDigit, performEquals, reset]);

  const keys = useMemo<KeyItem[]>(
    () => [
      {
        kind: "action",
        label: "",
        ariaLabel: "Delete last digit",
        action: backspace,
        variant: "function",
        icon: <Delete aria-hidden="true" />,
        metaLabel: "UNDO",
      },
      {
        kind: "action",
        label: "AC",
        ariaLabel: "All clear",
        action: reset,
        variant: "function",
        metaLabel: "CLEAR",
      },
      {
        kind: "action",
        label: "%",
        ariaLabel: "Percent",
        action: applyPercent,
        variant: "function",
        metaLabel: "ATK",
      },
      {
        kind: "operator",
        label: "÷",
        ariaLabel: "Divide",
        operator: "divide",
        className: "bg-primary text-primary-foreground",
        metaLabel: "DIV",
      },
      { kind: "digit", label: "7", ariaLabel: "Seven", value: "7", metaLabel: "PITCH" },
      { kind: "digit", label: "8", ariaLabel: "Eight", value: "8", metaLabel: "TIME" },
      { kind: "digit", label: "9", ariaLabel: "Nine", value: "9", metaLabel: "START" },
      {
        kind: "operator",
        label: "×",
        ariaLabel: "Multiply",
        operator: "multiply",
        className: "bg-primary text-primary-foreground",
        metaLabel: "MUL",
      },
      { kind: "digit", label: "4", ariaLabel: "Four", value: "4", metaLabel: "HPF" },
      { kind: "digit", label: "5", ariaLabel: "Five", value: "5", metaLabel: "FX" },
      { kind: "digit", label: "6", ariaLabel: "Six", value: "6", metaLabel: "FILTER" },
      {
        kind: "operator",
        label: "-",
        ariaLabel: "Subtract",
        operator: "subtract",
        className: "bg-primary text-primary-foreground",
        metaLabel: "SUB",
      },
      { kind: "digit", label: "1", ariaLabel: "One", value: "1", metaLabel: "REL" },
      { kind: "digit", label: "2", ariaLabel: "Two", value: "2", metaLabel: "PAN" },
      { kind: "digit", label: "3", ariaLabel: "Three", value: "3", metaLabel: "MODE" },
      {
        kind: "operator",
        label: "+",
        ariaLabel: "Add",
        operator: "add",
        className: "bg-primary text-primary-foreground",
        metaLabel: "ADD",
      },
      {
        kind: "action",
        label: "±",
        ariaLabel: "Toggle positive or negative",
        action: toggleSign,
        variant: "secondary",
        className: "text-secondary-foreground",
        metaLabel: "LPF",
      },
      { kind: "digit", label: "0", ariaLabel: "Zero", value: "0", metaLabel: "VEL" },
      {
        kind: "action",
        label: ".",
        ariaLabel: "Decimal point",
        action: inputDecimal,
        variant: "secondary",
        className: "text-secondary-foreground",
        metaLabel: "TUNE",
      },
      {
        kind: "action",
        label: "=",
        ariaLabel: "Equals",
        action: performEquals,
        variant: "default",
        className: "text-primary-foreground",
        metaLabel: "ENTER",
      },
    ],
    [applyPercent, backspace, inputDecimal, performEquals, reset, toggleSign],
  );

  return (
    <main className="relative isolate flex h-dvh items-center justify-center overflow-clip bg-inverse-surface px-4 py-3 text-foreground sm:px-8">
      <div className="ambient-plane" aria-hidden="true" />
      <h1 className="sr-only">Calculator</h1>

      <section
        className="calculator-shell relative flex w-full max-w-[24.25rem] flex-col overflow-hidden rounded-[var(--radius-shell)] border-l border-t border-white/40 border-b-4 border-r-4 border-b-black/20 border-r-black/20 bg-card shadow-shell"
        aria-label="Calculator"
      >
        <div className="relative z-10 flex h-8 divide-x divide-[#c0c0c0] border-b border-[#a0a0a0] bg-chassis-high font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div className="flex flex-1 items-center justify-center bg-white">Output</div>
          <div className="flex flex-1 items-center justify-center bg-primary text-white">Input</div>
          <div className="flex flex-[1.5] items-center justify-around bg-secondary text-white">
            <span>Sync</span>
            <span className="size-1 rounded-full bg-primary" />
            <span>Midi</span>
          </div>
          <div className="flex flex-1 items-center justify-center bg-[#a0a0a0] text-white">USB</div>
          <div className="flex flex-[1.2] items-center justify-center">Power</div>
        </div>

        <div className="relative flex min-h-24 border-b border-[#c0c0c0]">
          <div className="z-10 flex-1 p-5">
            <p className="font-sans text-[2rem] font-bold leading-none tracking-[-0.08em] text-[#333]">
              K.O. II
            </p>
            <p className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.08em] text-primary">
              Calculator
            </p>
            <p className="mt-5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.22em] text-[#666]">
              64 MB Sampler Composer
            </p>
          </div>
          <div className="speaker-pattern w-[44%] border-l border-[#c0c0c0] bg-[#cccccc] opacity-80" aria-hidden="true" />
        </div>

        <div className="relative flex min-h-24 flex-col justify-center overflow-hidden border-y-2 border-[#111] bg-lcd px-5 py-3 shadow-display sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10 mb-2 flex items-center justify-between font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-primary/80">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-primary shadow-[0_0_8px_#ff5c00]" />
              <span className="border border-primary px-1 text-[0.5rem] leading-4">{displayMode}</span>
            </div>
            <div className="min-w-0 max-w-[58%] truncate text-right text-[#777]" aria-hidden="true">
              {expression || "MEMORY CLEAR"}
            </div>
          </div>
          <output
            className={cn(
              "calculator-display lcd-glow relative z-10 block min-h-[4.25rem] text-right font-lcd font-bold leading-none tracking-[0.1em] text-lcd-foreground tabular-nums",
              hasError && "text-destructive lcd-glow",
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {display}
          </output>
        </div>

        <div className="flex items-center justify-between gap-5 border-b border-[#c0c0c0] bg-card px-5 py-3 sm:px-6">
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.08em]">
            <div className="micro-key-well">
              <button
                aria-label="Set STD display mode"
                aria-pressed={displayMode === "STD"}
                className="micro-key micro-key-dark rounded-[0.125rem] bg-secondary px-3 py-1 text-white"
                type="button"
                onClick={() => setDisplayMode("STD")}
              >
                STD
              </button>
            </div>
            <div className="micro-key-well">
              <button
                aria-label="Set SCI display mode"
                aria-pressed={displayMode === "SCI"}
                className="micro-key micro-key-dark rounded-[0.125rem] bg-secondary px-3 py-1 text-white"
                type="button"
                onClick={() => setDisplayMode("SCI")}
              >
                SCI
              </button>
            </div>
            <div className="micro-key-well">
              <button
                aria-label="Set CONV display mode"
                aria-pressed={displayMode === "CONV"}
                className="micro-key micro-key-light rounded-[0.125rem] bg-[#c7c3c0] px-3 py-1 text-[#444]"
                type="button"
                onClick={() => setDisplayMode("CONV")}
              >
                CONV
              </button>
            </div>
            <div className="micro-key-well">
              <button
                aria-label="Set MATH display mode"
                aria-pressed={displayMode === "MATH"}
                className="micro-key micro-key-orange rounded-[0.125rem] bg-primary px-3 py-1 text-white"
                type="button"
                onClick={() => setDisplayMode("MATH")}
              >
                MATH
              </button>
            </div>
          </div>
          <div className="relative flex items-center gap-6">
            <div className="knob relative size-9 rounded-full border-2 border-[#d94f00] bg-primary shadow-knob" aria-hidden="true" />
            <div className="knob relative size-9 rounded-full border-2 border-[#111] bg-secondary shadow-knob" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-3 gap-y-3 bg-card p-5 sm:p-5" role="group" aria-label="Calculator keys">
          {keys.map((key, index) => {
            const isActiveOperator =
              key.kind === "operator" && operator === key.operator && waitingForOperand;
            const ledClassName = cn(
              "inline-block size-2 shrink-0 rounded-full",
              key.kind === "operator" ? "bg-[#555]" : "bg-transparent",
              isActiveOperator && "bg-primary shadow-[0_0_5px_#ff5c00]",
            );
            const keyId = key.kind === "digit" ? key.value : key.kind === "operator" ? key.operator : key.ariaLabel;

            if (key.kind === "digit") {
              return (
                <div key={`${keyId}-${index}`} className="flex min-w-0 flex-col items-center gap-1">
                  <div className="key-well">
                    <Button
                      className={cn("relative text-secondary-foreground", key.className)}
                      size="key"
                      variant="secondary"
                      aria-label={key.ariaLabel}
                      onClick={() => inputDigit(key.value)}
                    >
                      {key.label}
                    </Button>
                  </div>
                  <span className="flex min-w-0 max-w-full items-center gap-1 truncate font-mono text-[0.5rem] font-medium uppercase tracking-[0.08em] text-secondary/80" aria-hidden="true">
                    <span className={ledClassName} />
                    <span className="min-w-0 truncate">{key.metaLabel}</span>
                  </span>
                </div>
              );
            }

            if (key.kind === "operator") {
              return (
                <div key={`${keyId}-${index}`} className="flex min-w-0 flex-col items-center gap-1">
                  <div className="key-well">
                    <Button
                      className={cn(
                        "relative text-[1.65rem]",
                        isActiveOperator && "ring-2 ring-ring ring-offset-2 ring-offset-card",
                        key.className,
                      )}
                      size="key"
                      variant="operator"
                      aria-label={key.ariaLabel}
                      aria-pressed={isActiveOperator}
                      onClick={() => chooseOperator(key.operator)}
                    >
                      {key.label}
                    </Button>
                  </div>
                  <span className="flex min-w-0 max-w-full items-center gap-1 truncate font-mono text-[0.5rem] font-medium uppercase tracking-[0.08em] text-secondary/80" aria-hidden="true">
                    <span className={ledClassName} />
                    <span className="min-w-0 truncate">{key.metaLabel}</span>
                  </span>
                </div>
              );
            }

            return (
              <div key={`${keyId}-${index}`} className="flex min-w-0 flex-col items-center gap-1">
                <div className="key-well">
                  <Button
                    key={`${key.ariaLabel}-${index}`}
                    className={cn("relative text-muted-foreground", key.icon && "text-[1.2rem]", key.className)}
                    size="key"
                    variant={key.variant}
                    aria-label={key.ariaLabel}
                    onClick={key.action}
                  >
                    <span>{key.label}</span>
                    {key.icon}
                  </Button>
                </div>
                <span className="flex min-w-0 max-w-full items-center gap-1 truncate font-mono text-[0.5rem] font-medium uppercase tracking-[0.08em] text-secondary/80" aria-hidden="true">
                  <span className={ledClassName} />
                  <span className="min-w-0 truncate">{key.metaLabel}</span>
                </span>
              </div>
            );
          })}

        </div>
      </section>
    </main>
  );
}
