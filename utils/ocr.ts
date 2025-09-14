export async function performOCR(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Failed to capture image");

  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const response = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base64,
      mimeType: "image/png",
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("OCR request failed: Invalid JSON response");
  }

  if (!response.ok) {
    throw new Error(`OCR request failed: ${result.error || "Unknown error"}`);
  }

  return result.text;
}
