import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ProfilePhotoUploadProps {
  value?: string;
  onChange: (photoData: string) => void;
  error?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ value, onChange, error }) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showEditor, setShowEditor] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CANVAS_SIZE = 200; // Fixed square size for profile photo

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !originalImage) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Save context for transformations
    ctx.save();

    // Move to center of canvas
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(scale, scale);

    // Calculate image dimensions to fit in circle while maintaining aspect ratio
    const aspectRatio = originalImage.width / originalImage.height;
    let drawWidth, drawHeight;

    if (aspectRatio > 1) {
      // Landscape
      drawHeight = CANVAS_SIZE;
      drawWidth = drawHeight * aspectRatio;
    } else {
      // Portrait or square
      drawWidth = CANVAS_SIZE;
      drawHeight = drawWidth / aspectRatio;
    }

    // Draw image centered with position offset
    ctx.drawImage(
      originalImage,
      -drawWidth / 2 + position.x,
      -drawHeight / 2 + position.y,
      drawWidth,
      drawHeight
    );

    // Restore context
    ctx.restore();

    // Create circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [originalImage, rotation, scale, position]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setRotation(0);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setShowEditor(true);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;

    // Prevent default touch actions like scrolling
    // Note: This might not work in all browsers due to passive event listeners,
    // so we also add touch-action: none to the canvas style.

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  const handleScaleChange = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(3, newScale)));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onChange(dataUrl);
    setShowEditor(false);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setShowEditor(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative pb-5">
      <label className="block text-sm font-medium text-[#555555] mb-1">
        Profile Photo
        <span className="text-xs text-gray-400 ml-1">(Optional)</span>
      </label>

      <div className="flex flex-col items-center space-y-4">
        {/* Photo Preview */}
        <div className="relative">
          {value ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E7A700] bg-gray-100">
              <img
                src={value}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E7A700] border border-transparent rounded-md shadow-sm hover:bg-[#CF9500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]"
          >
            {value ? 'Change Photo' : 'Upload Photo'}
          </button>

          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Photo Editor Modal */}
      {showEditor && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4">Edit Profile Photo</h3>

            {/* Canvas for editing */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="border-2 border-[#E7A700] rounded-full cursor-move"
                  style={{ width: '200px', height: '200px', touchAction: 'none' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <p className="text-xs text-gray-500 text-center mt-2">Drag to reposition</p>
              </div>

              {/* Controls */}
              <div className="w-full space-y-3">
                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleRotate(-90)}
                      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      ↺ 90°
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRotate(90)}
                      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      ↻ 90°
                    </button>
                    <span className="text-xs text-gray-500 w-8">{rotation}°</span>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleScaleChange(scale - 0.1)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleScaleChange(scale + 0.1)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-500 w-8">{scale.toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 w-full">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#E7A700] border border-transparent rounded-md shadow-sm hover:bg-[#CF9500]"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
    </div>
  );
};

export default ProfilePhotoUpload;