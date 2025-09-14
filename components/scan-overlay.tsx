"use client";
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanOverlayProps {
  onClose: () => void;
  onCapture: () => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start camera when component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // use "user" for selfie mode
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      // Stop camera when overlay closes
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 backdrop-blur p-8 flex flex-col">
      <div className="flex justify-end">
        {/* Close Button */}
        <Button
          variant="destructive"
          size="icon"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="grid grid-rows-[10%_80%_10%] flex-1 max-w-lg mx-auto gap-2">
        {/* Top section: Instructions */}
        <div className="flex items-end justify-center">
          <h2 className="text-l md:text-xl text-center">
            Position your passport inside the frame and click the capture button
          </h2>
        </div>

        {/* Middle section: Video / Passport Frame */}
       <div className="flex items-center justify-center relative">
        <div className="relative w-full aspect-[1.75/1] border-2 border-dashed rounded-md border-black overflow-hidden">
          {/* Video fills the whole outer box */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-md"
          />

          {/* Inner guideline overlay */}
          <div className="absolute inset-0 m-8 border-2 border-black rounded-md pointer-events-none"></div>
        </div>
      </div>

        {/* Bottom section: Capture Button */}
        <div className="flex items-start justify-center">
          <button
            onClick={onCapture}
            className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-gray-300 transition"
          >
            ●
          </button>
        </div>
      </div>
    </div>
  );
};
