import { useEffect, useState } from 'react';
import { useZxing } from 'react-zxing';
import { FaTimes, FaCamera, FaExclamationTriangle, FaSync } from 'react-icons/fa';

interface QRScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onResult, onClose }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [usingFrontCamera, setUsingFrontCamera] = useState(false);

  // Configure camera constraints to prefer back camera
  const constraints = {
    video: {
      facingMode: usingFrontCamera ? "user" : "environment", // "environment" is back camera
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.getText());
    },
    onError(error: any) {
      console.error("QR Scanner error:", error);
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please grant permission to use your camera.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${error.message}`);
      }
    },
    constraints: constraints
  });

  // Function to toggle between front and back cameras
  const toggleCamera = () => {
    setUsingFrontCamera(!usingFrontCamera);
  };

  useEffect(() => {
    // Check for camera permissions
    async function checkCameraPermission() {
      try {
        // Check if mediaDevices API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Camera API not supported. Please use HTTPS or a modern browser.");
          setHasPermission(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: usingFrontCamera ? "user" : "environment"
          }
        });
        setHasPermission(true);
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        console.error("Permission check error:", err);
        setHasPermission(false);
        if (err.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please grant permission to use your camera.");
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else if (err.name === "NotSupportedError") {
          setCameraError("Camera not supported. Please use HTTPS.");
        } else {
          setCameraError(`Camera error: ${err.message || 'Unknown error'}`);
        }
      }
    }

    checkCameraPermission();
  }, [usingFrontCamera]);

  if (hasPermission === false || cameraError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600 flex items-center">
            <FaExclamationTriangle className="mr-2" /> Camera Error
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <p className="text-red-700 text-sm">{cameraError}</p>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>To use the QR scanner, please:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Make sure you're using HTTPS (secure connection)</li>
            <li>Grant camera permissions when prompted</li>
            <li>Try using a different browser if issues persist</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-4"></div>
        <p className="text-gray-600">Requesting camera access...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-green-800 flex items-center">
          <FaCamera className="mr-2" /> Scan QR Code
        </h3>
        <div className="flex items-center">
          <button
            onClick={toggleCamera}
            className="text-green-600 hover:text-green-800 mr-3"
            title="Switch Camera"
          >
            <FaSync />
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '300px', height: '300px' }}>
        <video
          ref={ref}
          className="w-full h-full object-cover"
          style={{ transform: usingFrontCamera ? 'scaleX(-1)' : 'none' }} // Only mirror for front camera
        />
        <div className="absolute inset-0 border-2 border-green-500 opacity-50 pointer-events-none"></div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-3">
        Position the QR code within the frame
      </p>
      <p className="text-center text-xs text-gray-500 mt-1">
        {usingFrontCamera ? 'Using front camera' : 'Using back camera'} • Tap <FaSync className="inline text-xs" /> to switch
      </p>
    </div>
  );
}
