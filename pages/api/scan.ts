import type { NextApiRequest, NextApiResponse } from "next";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

const client = new DocumentProcessorServiceClient({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL!,
    private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
  projectId: process.env.GCP_PROJECT_ID!,
  apiEndpoint: `${process.env.DOCUMENTAI_LOCATION}-documentai.googleapis.com`,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64, mimeType } = req.body || {};
  if (!base64 || !mimeType) return res.status(400).json({ error: "Missing base64 or mimeType" });

  try {
    const name = `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.DOCUMENTAI_LOCATION}/processors/${process.env.DOCUMENTAI_PROCESSOR_ID}`;

    const [result] = await client.processDocument({
      name,
      rawDocument: { content: base64, mimeType },
    });

    if (!result.document?.text) return res.status(500).json({ error: "No text extracted" });

    return res.status(200).json({ text: result.document.text });
  } catch (err: Error | unknown) {
    console.error("Document AI error:", err);

    return res.status(500).json({
      error: "Document AI processing failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
