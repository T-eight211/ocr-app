// utils/mrzParser.ts

export interface MRZData {
  documentType: string;
  countryCode: string;
  surname: string;
  givenNames: string;
  documentNumber: string;
  nationality: string;
  dateOfBirth: string; // DD/MM/YYYY
  sex: string;
  dateOfExpiry: string; // DD/MM/YYYY
}

/**
 * Parses MRZ from OCR text by using the **last two non-empty lines**.
 */
export function parseMRZ(ocrText: string): MRZData {
  // Split lines and filter out empty lines
  const lines = ocrText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Invalid MRZ: less than 2 lines detected");
  // Find the index of the first line that looks like MRZ (contains <<< or <<)
  const mrzIndex = lines.findIndex(l => l.includes("<<<") || l.includes("<<"));
  if (mrzIndex === -1 || mrzIndex + 1 >= lines.length) {
    throw new Error("Invalid MRZ: could not find two consecutive MRZ lines");
  }

  // Take that line as line1 and the very next line as line2
  const line1 = lines[mrzIndex];
  const line2 = lines[mrzIndex + 1];

  // Line 1
  const documentType = line1.substring(0, 1);
  const countryCode = line1.substring(2, 5);
  const namesRaw = line1.substring(5).split("<<");
  const surname = namesRaw[0].replace(/</g, " ").trim();
  const givenNames = namesRaw[1]?.replace(/</g, " ").trim() || "";

  // Line 2
  const documentNumber = line2.substring(0, 9).replace(/</g, "");
  const nationality = line2.substring(10, 13);
  const dateOfBirthRaw = line2.substring(13, 19);
  const sex = line2.substring(20, 21);
  const dateOfExpiryRaw = line2.substring(21, 27);

  // Convert dates to DD/MM/YYYY (handles 1900/2000 logic if needed)
  const convertMRZDate = (mrzDate: string): string => {
    if (!/^\d{6}$/.test(mrzDate)) return "";

    const yy = parseInt(mrzDate.slice(0, 2), 10);
    const mm = parseInt(mrzDate.slice(2, 4), 10);
    const dd = parseInt(mrzDate.slice(4, 6), 10);

    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return "";

    let fullYear = 2000 + yy;
    // if (fullYear > new Date().getFullYear()) fullYear -= 100; // shift to 1900s if needed

    const date = new Date(fullYear, mm - 1, dd);
    if (isNaN(date.getTime())) return "";

    return `${String(dd).padStart(2, "0")}/${String(mm).padStart(2, "0")}/${fullYear}`;
  };

  const dateOfBirth = convertMRZDate(dateOfBirthRaw);
  const dateOfExpiry = convertMRZDate(dateOfExpiryRaw);

  return {
    documentType,
    countryCode,
    surname,
    givenNames,
    documentNumber,
    nationality,
    dateOfBirth,
    sex,
    dateOfExpiry,
  };
}
