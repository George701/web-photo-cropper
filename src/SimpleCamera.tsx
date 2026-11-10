import { useState, useRef, useCallback, useEffect } from 'react';

export const SimpleCamera = () => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCameraOpen(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      document.getElementById('camera-fallback')?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      document.getElementById('camera-fallback')?.click();
    }
  }, [facingMode]);

  const handleSwitch = useCallback(async () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);

    const next = facingMode === 'environment' ? 'user' : 'environment';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      setFacingMode(next);
    } catch {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
    }
  }, [facingMode]);

  useEffect(() => {
    if (cameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleShoot = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    console.log('Снимок готов:', dataUrl.slice(0, 50) + '...');
    alert('Снимок сделан! (в консоли dataUrl)');
  };

  const handleFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      console.log('Fallback снимок:', dataUrl.slice(0, 50) + '...');
      alert('Снимок через input capture получен! (в консоли dataUrl)');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        id="camera-fallback"
        type="file"
        accept="image/*"
        capture={facingMode}
        style={{ display: 'none' }}
        onChange={handleFallback}
      />
      <button onClick={startCamera}>Открыть камеру</button>

      {cameraOpen && (
        <div style={{ marginTop: 20 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: 500, background: '#111', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            onCanPlay={() => setCameraReady(true)}
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <button onClick={handleShoot} disabled={!cameraReady}>Снять</button>
            <button onClick={handleSwitch}>Переключить</button>
            <button onClick={stopCamera}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};