"use client";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const USD_WHOLE_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const USD_CENTS_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

const formatUsdAmount = (amount: number): string =>
  Number.isInteger(amount)
    ? USD_WHOLE_FORMATTER.format(amount)
    : USD_CENTS_FORMATTER.format(amount);

interface CounterToken {
  readonly char: string;
  readonly digit: number | null;
  readonly key: string;
}

const tokenizeFormattedUsd = (formatted: string): readonly CounterToken[] => {
  const [integerPart = "", fractionPart] = formatted.split(".");
  const tokens: CounterToken[] = [];

  for (let idx = 0; idx < integerPart.length; idx += 1) {
    const char = integerPart[idx] ?? "";
    const placeFromRight = integerPart.length - 1 - idx;
    const isDigit = char >= "0" && char <= "9";

    tokens.push({
      char,
      digit: isDigit ? Number(char) : null,
      key: isDigit
        ? `int-${String(placeFromRight)}`
        : `sep-${String(placeFromRight)}-${char}`,
    });
  }

  if (fractionPart !== undefined) {
    tokens.push({ char: ".", digit: null, key: "decimal-dot" });

    for (let idx = 0; idx < fractionPart.length; idx += 1) {
      const char = fractionPart[idx] ?? "";
      const isDigit = char >= "0" && char <= "9";

      tokens.push({
        char,
        digit: isDigit ? Number(char) : null,
        key: `frac-${String(idx)}`,
      });
    }
  }

  return tokens;
};

/**
 * Zero-dependency rolling tabular USD counter adapted from React Bits Counter
 * (`@react-bits/Counter-TS-TW`) for Global Fellowship's giving summary.
 * Renders an exact `sr-only` readout for screen readers and `aria-hidden`
 * CSS-transformed digit reels that collapse to instant transitions under
 * `prefers-reduced-motion: reduce`.
 */
export const RollingUsdCounter = ({
  amount,
  className,
}: {
  readonly amount: number;
  readonly className?: string;
}) => {
  const formatted = formatUsdAmount(amount);
  const tokens = tokenizeFormattedUsd(formatted);

  return (
    <span className={className}>
      <span className="sr-only">{formatted}</span>
      <span
        aria-hidden="true"
        className="gf-tabular inline-flex items-baseline leading-none"
      >
        {tokens.map((token) =>
          token.digit === null ? (
            <span className="inline-block" key={token.key}>
              {token.char}
            </span>
          ) : (
            <span className="gf-counter-slot" key={token.key}>
              <span className="gf-counter-strip" data-digit={token.digit}>
                {DIGITS.map((digit) => (
                  <span className="gf-counter-digit" key={digit}>
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          )
        )}
      </span>
    </span>
  );
};
