// utils/mrzParser.ts

export interface MRZData {
  documentType: string;
  countryCode: string;
  surname: string;
  givenNames: string;
  documentNumber: string;
  nationality: string;
  dateOfBirth: string; // YYYY-MM-DD
  sex: string;
  dateOfExpiry: string; // YYYY-MM-DD
}

/**
 * Parses MRZ from OCR text by using the **last two non-empty lines**.
 */
export function parseMRZ(ocrText: string): MRZData {
  // Split lines and filter out empty lines
  const lines = ocrText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Invalid MRZ: less than 2 lines detected");

  // Take last two lines
  const line1 = lines[lines.length - 2];
  const line2 = lines[lines.length - 1];

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

  // Convert dates to YYYY-MM-DD (handles 1900/2000 logic if needed)
  const convertMRZDate = (mrzDate: string): string => {
    const yy = parseInt(mrzDate.slice(0, 2), 10);
    const mm = mrzDate.slice(2, 4);
    const dd = mrzDate.slice(4, 6);
    const currentYear = new Date().getFullYear() % 100;
    const fullYear = yy > currentYear ? 1900 + yy : 2000 + yy;
    return `${fullYear}-${mm}-${dd}`;
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
