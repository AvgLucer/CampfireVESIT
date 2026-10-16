import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  WhiteboardStroke,
  WhiteboardTool,
  WhiteboardPoint,
  PeerLearningRoom,
} from '../../types/peerLearning';
import { UserProfile } from '../../types';
import {
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Users,
  Wifi,
  Copy,
  Check,
  LogOut,
  Flame,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface WhiteboardCanvasProps {
  room: PeerLearningRoom;
  currentUser: UserProfile;
  strokes: WhiteboardStroke[];
  onAddStroke: (stroke: WhiteboardStroke) => Promise<void>;
  onUndo: () => Promise<void>;
  onRedo: () => Promise<void>;
  onClear: () => Promise<void>;
  onLeave: () => Promise<void>;
  onShredAndEnd: () => Promise<void>;
}

const PALETTE = [
  { label: 'Black', value: '#171916' },
  { label: 'Campfire Orange', value: '#F97316' },
  { label: 'Royal Blue', value: '#2563EB' },
  { label: 'Emerald Green', value: '#10B981' },
  { label: 'Purple', value: '#9333EA' },
  { label: 'Ruby Red', value: '#DC2626' },
  { label: 'Golden Amber', value: '#D97706' },
  { label: 'Charcoal', value: '#4B5563' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2, dotSize: 4 },
  { label: 'Medium', value: 5, dotSize: 7 },
  { label: 'Bold', value: 10, dotSize: 11 },
  { label: 'Extra', value: 18, dotSize: 16 },
];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  room,
  currentUser,
  strokes,
  onAddStroke,
  onUndo,
  onRedo,
  onClear,
  onLeave,
  onShredAndEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools & Styling state
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#171916');
  const [selectedWidth, setSelectedWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showShredConfirm, setShowShredConfirm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Local active stroke points while drawing
  const currentPointsRef = useRef<WhiteboardPoint[]>([]);

  const isHost = room.hostId === currentUser.userId;
  const isJoinerConnected = Boolean(room.joinerId);

  // Copy Room PIN
  const handleCopyPin = () => {
    navigator.clipboard.writeText(room.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Redraw all strokes onto the canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Filter out undone strokes
    const visibleStrokes = strokes.filter((s) => !s.isUndone);

    // Draw saved strokes
    visibleStrokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.width * (width / 800) * 1.8;
      } else if (stroke.tool === 'marker') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * (width / 800) * 2.8;
      } else if (stroke.tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = Math.max(1, stroke.width * (width / 800) * 0.85);
      } else {
        // Standard pen
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * (width / 800);
      }

      const p0 = stroke.points[0];
      ctx.moveTo(p0.x * width, p0.y * height);

      if (stroke.points.length === 1) {
        ctx.arc(p0.x * width, p0.y * height, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x * width, pt.y * height);
        }
        ctx.stroke();
      }
      ctx.restore();
    });

    // Render in-progress stroke if user is drawing locally
    if (currentPointsRef.current.length > 0) {
      const pts = currentPointsRef.current;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = selectedWidth * (width / 800) * 1.8;
      } else if (activeTool === 'marker') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedWidth * (width / 800) * 2.8;
      } else if (activeTool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = Math.max(1, selectedWidth * (width / 800) * 0.85);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedWidth * (width / 800);
      }

      ctx.moveTo(pts[0].x * width, pts[0].y * height);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * width, pts[i].y * height);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes, activeTool, selectedColor, selectedWidth]);

  // Resize canvas to match container with device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Re-render whenever strokes change
  useEffect(() => {
    renderCanvas();
  }, [strokes, renderCanvas]);

  // Pointer drawing handlers (Desktop mouse + Mobile touch + Stylus)
  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): WhiteboardPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pt = getNormalizedPoint(e);
    if (!pt) return;

    setIsDrawing(true);
    currentPointsRef.current = [pt];
    renderCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const pt = getNormalizedPoint(e);
    if (!pt) return;

    currentPointsRef.current.push(pt);
    renderCanvas();
  };

  const handlePointerUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore capture release error
    }

    const points = currentPointsRef.current;
    currentPointsRef.current = [];

    if (points.length === 0) return;

    const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newStroke: WhiteboardStroke = {
      id: strokeId,
      roomId: room.id,
      userId: currentUser.userId,
      userName: currentUser.name,
      tool: activeTool,
      color: selectedColor,
      width: selectedWidth,
      points,
      createdAt: new Date().toISOString(),
      isUndone: false,
    };

    await onAddStroke(newStroke);
  };

  // Export board snapshot as PNG
  const handleExportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Fill white
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    // Draw original content
    exportCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `VESIT_Whiteboard_${room.pin}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const canUndo = strokes.some((s) => !s.isUndone);
  const canRedo = strokes.some((s) => s.isUndone);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-xl overflow-hidden select-none">
      {/* 1. ROOM HEADER: Topic, PIN, Participants & Connection Status */}
      <div className="p-3.5 sm:p-4 bg-[#FAF9F5] dark:bg-neutral-850 border-b border-[#E5E3DC] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#F97316] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#171916] dark:text-neutral-100 truncate max-w-[220px] sm:max-w-md">
                {room.title}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] dark:text-neutral-300">
                {room.subjectCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#737871] dark:text-neutral-400 mt-0.5">
              <span>Room PIN:</span>
              <button
                type="button"
                onClick={handleCopyPin}
                className="font-mono font-black text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                title="Click to copy PIN"
              >
                <span>{room.pin}</span>
                {copiedPin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* 1-on-1 Participant Pills */}
        <div className="flex items-center gap-2">
          {/* Host Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#171916] dark:text-neutral-200 truncate max-w-[100px]">
              {room.hostName}
            </span>
            <span className="text-[9px] font-mono uppercase font-black bg-orange-100 text-[#F97316] dark:bg-orange-950 px-1 py-0.2 rounded">
              Host
            </span>
          </div>

          <span className="text-xs text-[#737871] font-bold">✕</span>

          {/* Joiner Indicator */}
          {isJoinerConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#171916] dark:text-neutral-200 truncate max-w-[100px]">
                {room.joinerName}
              </span>
              <span className="text-[9px] font-mono uppercase font-black bg-blue-100 text-blue-600 dark:bg-blue-950 px-1 py-0.2 rounded">
                Peer
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-semibold text-[11px]">Waiting for peer to join...</span>
            </div>
          )}

          {/* End & Shred Session (Host) or Leave Session (Joiner) */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={handleExportSnapshot}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-[#FAF9F5] border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] dark:text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              title="Download Whiteboard PNG Snapshot"
            >
              <Download className="w-4 h-4" />
            </button>

            {isHost ? (
              <button
                type="button"
                onClick={() => setShowShredConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="End session and permanently shred from Firebase"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">End & Shred Room</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLeave}
                className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#171916] dark:text-neutral-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DRAWING TOOLBAR: Tools, Colors, Widths, Undo, Redo, Clear */}
      <div className="px-3 py-2 bg-white dark:bg-neutral-900 border-b border-[#E5E3DC] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Drawing Tools Selection */}
        <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-neutral-800 p-1 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
            title="Pen (Smooth freehand drawing)"
          >
            <Pen className="w-4 h-4" />
            <span className="hidden md:inline">Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('pencil')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'pencil'
                ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
            title="Pencil (Soft fine sketch)"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden md:inline">Pencil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('marker')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'marker'
                ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
            title="Marker (Semi-transparent highlighter)"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden md:inline">Marker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-[#171916] text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-[#737871] hover:text-[#171916] dark:hover:text-neutral-200'
            }`}
            title="Eraser (Erase drawing strokes)"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden md:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette (Active unless eraser is selected) */}
        {activeTool !== 'eraser' && (
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] dark:bg-neutral-800 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700">
            {PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  selectedColor === c.value ? 'ring-2 ring-offset-2 ring-[#F97316] scale-110 shadow-xs' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}

            {/* Custom native color picker */}
            <label
              className="w-6 h-6 rounded-full overflow-hidden border border-[#D7D4CB] cursor-pointer flex items-center justify-center shadow-2xs hover:scale-105 transition-transform"
              title="Custom color picker"
            >
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="opacity-0 w-full h-full cursor-pointer"
              />
              <span className="text-[10px] font-black text-[#737871] pointer-events-none">+</span>
            </label>
          </div>
        )}

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] dark:bg-neutral-800 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.label}
              type="button"
              onClick={() => setSelectedWidth(sw.value)}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                selectedWidth === sw.value
                  ? 'bg-white dark:bg-neutral-900 border border-[#D7D4CB] text-[#171916] dark:text-neutral-100 font-bold shadow-2xs'
                  : 'text-[#737871] hover:text-[#171916]'
              }`}
              title={`${sw.label} stroke thickness`}
            >
              <span
                className="rounded-full bg-current shrink-0"
                style={{ width: sw.dotSize, height: sw.dotSize }}
              />
              <span className="hidden lg:inline">{sw.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls: Undo, Redo, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-2 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-200 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Shared Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-2 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#171916] dark:text-neutral-200 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Shared Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Clear Shared Whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE CANVAS DRAWING SURFACE */}
      <div
        ref={containerRef}
        className="flex-1 relative w-full h-full bg-[#FFFFFF] dark:bg-neutral-950 overflow-hidden cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Empty state hint if zero strokes */}
        {strokes.filter((s) => !s.isUndone).length === 0 && !isDrawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-6 text-[#737871] dark:text-neutral-500 space-y-2">
            <div className="w-12 h-12 rounded-3xl bg-orange-100/70 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center font-bold text-xl">
              ✍️
            </div>
            <h3 className="text-sm font-bold text-[#171916] dark:text-neutral-200">
              Interactive 1-on-1 Whiteboard Ready
            </h3>
            <p className="text-xs max-w-sm">
              Use your pen, pencil, or highlighter to draw diagrams, equations, and brainstorm with your peer in real time.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: CLEAR BOARD CONFIRMATION */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171916] dark:text-neutral-100">
                Clear Shared Whiteboard?
              </h3>
              <p className="text-xs text-[#555952] dark:text-neutral-400 mt-1 leading-relaxed">
                This will erase all drawing strokes from the shared whiteboard for both participants. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#555952] dark:text-neutral-400 hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowClearConfirm(false);
                  await onClear();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Clear Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHRED & END ROOM CONFIRMATION (Host only) */}
      {showShredConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171916] dark:text-neutral-100">
                End & Shred Session from Firebase?
              </h3>
              <p className="text-xs text-[#555952] dark:text-neutral-400 mt-1 leading-relaxed">
                As requested, this will terminate the session and permanently shred/delete all room records and whiteboard drawing data from Firebase Firestore so it disappears completely.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShredConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#555952] dark:text-neutral-400 hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={async () => {
                  setIsActionLoading(true);
                  await onShredAndEnd();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4" />
                <span>Permanently Shred & End</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
