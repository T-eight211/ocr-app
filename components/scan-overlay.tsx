"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { performOCR } from "@/utils/ocr";
import { parseMRZ } from "@/utils/mrzParser";
import NextImage from "next/image";

interface ScanOverlayProps {
  onClose: () => void;
  onCapture: (data: {
    ocrText: string;
    parsed: { givenNames: string; surname: string; dateOfBirth?: string; dateOfExpiry?: string; documentNumber: string; documentType: string };
  }) => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setError("Could not access the camera. Check permissions.");
      setShowAlert(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!capturedImage) startCamera();
    return () => stopCamera();
  }, [capturedImage]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    setCapturedImage(canvas.toDataURL("image/png"));
  };

  const handleProcess = async () => {
    if (!capturedImage) return;
    setLoading(true);
    try {
      // OCR
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = capturedImage;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");
      ctx.drawImage(img, 0, 0);

      const ocrText = await performOCR(canvas);
      let parsed;
      try {
        parsed = parseMRZ(ocrText); // MRZ parsing
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "MRZ parsing failed";
        setParseError(message);
        throw new Error(message); // will trigger alert
      }

      // send data to parent
      onCapture({ ocrText, parsed });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Processing failed. Try again.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowAlert(false);
    setError(null);
    setParseError(null); // reset parsing errors
    startCamera();
  };


  const handleClose = () => {
    stopCamera();
    onClose();
    setCapturedImage(null);
    setShowAlert(false);
    setError(null);
    setParseError(null); // reset parsing errors
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur p-8 flex flex-col">
        <div className="flex justify-end">
          <Button variant="destructive" size="icon" onClick={handleClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-rows-[1fr_6.5fr_2.5fr] flex-1 max-w-lg mx-auto gap-2 w-full">
          {/* Instructions */}
          <div className="flex items-end justify-center">
            <h2 className="text-l md:text-xl text-center">
              Position your passport inside the frame and click the capture button
            </h2>
          </div>

          {/* Video / Captured Image */}
          <div className="flex items-center justify-center relative">
            <div className="relative w-full aspect-[125/88] border-2 border-dashed rounded-md border-black overflow-hidden">
              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <NextImage src={capturedImage} alt="Captured" fill className="object-cover rounded-md" priority />
              )}
              <div className="absolute inset-0 m-4 border-2 border-black rounded-md pointer-events-none"></div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col items-stretch justify-end gap-2">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                className="relative w-16 h-16 mx-auto rounded-full border-4 border-black flex items-center justify-center bg-transparent active:scale-95 transition"
              >
                <span className="w-13 h-13 rounded-full bg-black"></span>
              </button>
            ) : (
              <>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleRetake} className="flex-1" disabled={loading}>
                    <RotateCcw /> Retake
                  </Button>
                  <Button variant="default" onClick={handleProcess} className="flex-1" disabled={loading}>
                    <Check /> {loading ? "Processing..." : "Prefill Form"}
                  </Button>
                </div>
                <Button variant="secondary" onClick={handleClose} className="w-full mt-2" disabled={loading}>
                  Done
                </Button>
              </>
            )}

            {loading && (
              <div className="mt-2">
                <Progress value={66} className="w-full" />
                <p className="text-center text-sm mt-1">Extracting text and parsing MRZ...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="w-[calc(100%-62px)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Something went wrong</AlertDialogTitle>
            <AlertDialogDescription>
              {parseError || error || "Processing failed. Please try again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleRetake}>Retake</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
