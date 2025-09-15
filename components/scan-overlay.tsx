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
import { performOCR } from "@/utils/ocr";

interface ScanOverlayProps {
  onClose: () => void;
  onCapture: (text: string) => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setOcrError("Could not access the camera. Please check permissions.");
      setShowAlert(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!capturedImage) startCamera();
    return () => stopCamera();
  }, [capturedImage]);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
  };

  const handlePrefill = async () => {
    if (!capturedImage) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = capturedImage;
    await new Promise((res) => (img.onload = res));

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    try {
      const text = await performOCR(canvas);
      onCapture(text);
    } catch (err: any) {
      console.error("OCR failed:", err);
      setOcrError(err.message || "OCR failed. Please try again.");
      setShowAlert(true);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur p-8 flex flex-col">
        <div className="flex justify-end">
          <Button variant="destructive" size="icon" onClick={handleClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-rows-[1fr_7fr_2fr] flex-1 max-w-lg mx-auto gap-2 w-full">
          {/* Instructions */}
          <div className="flex items-end justify-center">
            <h2 className="text-l md:text-xl text-center">
              Position your passport inside the frame and click the capture button
            </h2>
          </div>

          {/* Video or captured image */}
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
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover rounded-md"
                />
              )}
              <div className="absolute inset-0 m-4 border-2 border-black rounded-md pointer-events-none"></div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex flex-col items-stretch justify-end gap-2">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                className="w-12 h-12 mx-auto rounded-full bg-black flex items-center justify-center hover:bg-gray-300 transition"
              >
                ●
              </button>
            ) : (
              <>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleRetake}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw /> Retake
                  </Button>
                  <Button
                    variant="default"
                    onClick={handlePrefill}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Check /> Prefill Form
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="w-full mt-2"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog for OCR errors */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Something went wrong</AlertDialogTitle>
            <AlertDialogDescription>
              {ocrError || "Unable to process the image. Please try again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => {
              setShowAlert(false);
              handleRetake(); // reset state & restart camera
            }}
          >
            Retake
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
