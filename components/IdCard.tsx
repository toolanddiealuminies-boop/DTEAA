import React, { useState, useRef } from 'react';
import type { UserData } from '../types';

interface IdCardProps {
  userData: UserData;
}

const IdCard: React.FC<IdCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatAddress = () => {
    const parts = [
      userData.contact.address,
      userData.contact.city,
      userData.contact.state,
      userData.contact.country
    ].filter(Boolean);
    
    const addressText = parts.join(', ');
    return userData.contact.pincode ? `${addressText} - ${userData.contact.pincode}` : addressText;
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDownload = async () => {
    try {
      // Create high-resolution canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // High quality dimensions
      const cardWidth = 400;
      const cardHeight = 250;
      const gap = 50;
      const scale = 2; // For high DPI
      
      canvas.width = (cardWidth * 2 + gap) * scale;
      canvas.height = (cardHeight + 50) * scale;
      ctx.scale(scale, scale);
      
      // High quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, cardWidth * 2 + gap, cardHeight + 50);
      
      // Helper function for rounded rectangles
      const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
      };
      
      // FRONT CARD
      const frontGrad = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
      frontGrad.addColorStop(0, '#E7A700');
      frontGrad.addColorStop(1, '#CF9500');
      
      ctx.save();
      roundRect(10, 10, cardWidth - 20, cardHeight - 20, 15);
      ctx.fillStyle = frontGrad;
      ctx.fill();
      
      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.fill();
      ctx.restore();
      
      // Decorative elements
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cardWidth - 60, 50, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(60, cardHeight - 50, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      // Front text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('Dindigul Tool Engineering', cardWidth / 2, 45);
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('Alumni Association', cardWidth / 2, 65);
      
      // User info background
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      roundRect(25, 85, cardWidth - 70, 115, 10);
      ctx.fill();
      ctx.restore();
      
      // Photo section
      const photoSize = 70;
      const photoX = 40;
      const photoY = 100;
      
      const drawPhotoPlaceholder = () => {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        const initials = (userData.personal.firstName?.charAt(0) || '') + (userData.personal.lastName?.charAt(0) || '');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(initials, photoX + photoSize/2, photoY + photoSize/2 + 8);
        ctx.restore();
      };
      
      if (userData.personal.profilePhoto) {
        try {
          const img = new Image();
          // Handle both Supabase URLs and base64 data
          if (!userData.personal.profilePhoto.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
          }
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
              ctx.restore();
              
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI * 2);
              ctx.stroke();
              
              resolve();
            };
            img.onerror = () => {
              drawPhotoPlaceholder();
              resolve();
            };
            img.src = userData.personal.profilePhoto;
          });
        } catch {
          drawPhotoPlaceholder();
        }
      } else {
        drawPhotoPlaceholder();
      }
      
      // User details
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.font = 'bold 18px Arial, sans-serif';
      const fullName = `${userData.personal.firstName} ${userData.personal.lastName}`;
      ctx.fillText(fullName, 125, 125);
      
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(`Batch of ${userData.personal.passOutYear}`, 125, 145);
      ctx.fillText(`Blood Group: ${userData.personal.bloodGroup}`, 125, 165);
      
      // ID section
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      roundRect(25, 210, cardWidth - 70, 25, 8);
      ctx.fill();
      ctx.restore();
      
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText(`ID: ${userData.alumniId}`, cardWidth / 2, 228);
      
      // BACK CARD
      const backX = cardWidth + gap;
      const backGrad = ctx.createLinearGradient(backX, 0, backX + cardWidth, cardHeight);
      backGrad.addColorStop(0, '#2E2E2E');
      backGrad.addColorStop(1, '#555555');
      
      ctx.save();
      roundRect(backX + 10, 10, cardWidth - 20, cardHeight - 20, 15);
      ctx.fillStyle = backGrad;
      ctx.fill();
      
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.fill();
      ctx.restore();
      
      // Back decorative elements
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(backX + cardWidth - 60, 60, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(backX + 60, cardHeight - 60, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      // Back header
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText('Address', backX + cardWidth / 2, 55);
      
      // Underline
      ctx.strokeStyle = '#E7A700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(backX + cardWidth / 2 - 40, 65);
      ctx.lineTo(backX + cardWidth / 2 + 40, 65);
      ctx.stroke();
      
      // Address box
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      roundRect(backX + 30, 85, cardWidth - 80, 130, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      // Address text with proper formatting
      const address = formatAddress() || 'Address not provided';
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'left';
      
      const maxWidth = cardWidth - 100;
      const lineHeight = 20;
      const words = address.split(' ');
      let line = '';
      let y = 115;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), backX + 45, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), backX + 45, y);
      }
      
      // Labels
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT', cardWidth / 2, cardHeight + 35);
      ctx.fillText('BACK', backX + cardWidth / 2, cardHeight + 35);
      
      // Download
      const link = document.createElement('a');
      link.download = `${userData.personal.firstName}_${userData.personal.lastName}_Alumni_ID.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate ID card. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        ref={cardRef}
        className="w-full max-w-md mx-auto" 
        style={{ perspective: '1000px' }}
      >
        <div 
          className={`relative w-full h-64 transition-transform duration-700 cursor-pointer`}
          onClick={handleFlip}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side */}
          <div 
            className="front-side absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="bg-gradient-to-br from-[#E7A700] to-[#CF9500] p-6 h-full flex flex-col justify-between relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-white/20"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-white text-lg font-bold">Dindigul Tool Engineering</h3>
                  <h4 className="text-white text-base font-semibold">Alumni Association</h4>
                </div>
                
                {/* Photo and Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {userData.personal.profilePhoto ? (
                      <img 
                        src={userData.personal.profilePhoto} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-white/80 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/80 flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl font-bold">
                          {(userData.personal.firstName?.charAt(0) || '') + (userData.personal.lastName?.charAt(0) || '')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white text-xl font-bold truncate">
                      {userData.personal.firstName} {userData.personal.lastName}
                    </h2>
                    <p className="text-white/90 text-sm">Batch of {userData.personal.passOutYear}</p>
                    <p className="text-white/80 text-sm mt-1">Blood Group: {userData.personal.bloodGroup}</p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white text-lg font-bold text-center">
                    ID: {userData.alumniId}
                  </p>
                </div>
                
                {/* Flip Indicator */}
                <p className="text-white/60 text-xs text-center mt-2">
                  Click to see address
                </p>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="back-side absolute inset-0 w-full h-full rounded-xl shadow-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-gradient-to-br from-[#2E2E2E] to-[#555555] p-6 h-full flex flex-col justify-center relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-2 border-white/20"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full border-2 border-white/20"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="mb-8">
                  <h3 className="text-white text-xl font-bold mb-2">Address</h3>
                  <div className="w-20 h-px bg-[#E7A700] mx-auto"></div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <p className="text-white text-base leading-relaxed">
                    {formatAddress() || 'Address not provided'}
                  </p>
                </div>
                
                {/* Flip Indicator */}
                <p className="text-white/60 text-xs mt-6">
                  Click to flip back
                </p>
              </div>
            </div>
          </div>
      </div>
      
      </div>
      
      {/* Instructions and Download */}
      <div className="text-center mt-4 space-y-3">
        <p className="text-sm text-[#555555]">
          Your official DTE Alumni ID Card
        </p>
        
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-[#E7A700] hover:bg-[#CF9500] text-white font-medium rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download ID Card</span>
        </button>
        
        <p className="text-xs text-[#888888]">
          Click the card to flip • Download to save both sides
        </p>
      </div>
      
    </div>
  );
};

export default IdCard;