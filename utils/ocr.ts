import Tesseract from "tesseract.js";

export const performOCR = async (image: HTMLCanvasElement | string) => {
  try {
    const { data } = await Tesseract.recognize(image, "eng", {
      logger: (m: any) => console.log(m), // optional progress logs
    });
    return data.text;
  } catch (err) {
    console.error("OCR error:", err);
    return "";
  }
};
