// Convert numbers into Indian Rupee currency words
export function numberToWordsIndian(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return "";
  const parsed = Number(num);
  const n = Math.floor(Math.abs(parsed));
  const decimal = Math.round((Math.abs(parsed) - n) * 100);

  if (n === 0 && decimal === 0) return "Indian Rupee Zero Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(val) {
    if (val < 20) return a[val];
    const tens = b[Math.floor(val / 10)];
    const units = a[val % 10];
    return units ? `${tens}-${units}` : tens;
  }

  function convertThreeDigits(val) {
    const hundred = Math.floor(val / 100);
    const rest = val % 100;
    let str = "";
    if (hundred > 0) {
      str += `${a[hundred]} Hundred`;
    }
    if (rest > 0) {
      str += (str ? " " : "") + convertTwoDigits(rest);
    }
    return str;
  }

  let words = "";
  let remaining = n;

  // Crores (>= 1,00,00,000)
  const crore = Math.floor(remaining / 10000000);
  if (crore > 0) {
    words += (words ? " " : "") + (crore >= 100 ? convertThreeDigits(crore) : convertTwoDigits(crore)) + " Crore";
    remaining %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  const lakh = Math.floor(remaining / 100000);
  if (lakh > 0) {
    words += (words ? " " : "") + convertTwoDigits(lakh) + " Lakh";
    remaining %= 100000;
  }

  // Thousands (>= 1,000)
  const thousand = Math.floor(remaining / 1000);
  if (thousand > 0) {
    words += (words ? " " : "") + convertTwoDigits(thousand) + " Thousand";
    remaining %= 1000;
  }

  // Hundreds and units
  if (remaining > 0) {
    words += (words ? " " : "") + convertThreeDigits(remaining);
  }

  let result = `Indian Rupee ${words.trim()}`;
  if (decimal > 0) {
    result += ` and ${convertTwoDigits(decimal)} Paise`;
  }
  result += " Only";
  return result;
}
