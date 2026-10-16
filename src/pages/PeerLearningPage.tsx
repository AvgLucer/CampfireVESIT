import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PeerLearningRoom, WhiteboardStroke } from '../types/peerLearning';
import {
  createPeerLearningRoom,
  findRoomByPin,
  joinPeerLearningRoom,
  subscribeToRoom,
  subscribeToWhiteboardStrokes,
  addWhiteboardStroke,
  undoLastStroke,
  redoLastStroke,
  clearWhiteboard,
  leavePeerLearningRoom,
  shredAndEndRoom,
} from '../services/peerLearningFirestoreService';
import { WhiteboardCanvas } from '../components/learning/WhiteboardCanvas';
import {
  Users,
  Plus,
  KeyRound,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  BookOpen,
  Flame,
  Radio,
  Share2,
} from 'lucide-react';

export const PeerLearningPage: React.FC = () => {
  const { user, showToast } = useApp();

  // Active room session state
  const [activeRoom, setActiveRoom] = useState<PeerLearningRoom | null>(null);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);

  // Create room form state
  const [createTopic, setCreateTopic] = useState('');
  const [createSubject, setCreateSubject] = useState('FEC205 - C++ Programming');
  const [isCreating, setIsCreating] = useState(false);

  // Join room form state
  const [joinPin, setJoinPin] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Waiting room UI state
  const [copiedPin, setCopiedPin] = useState(false);

  // Real-time subscriptions cleanup ref
  const unsubRoomRef = useRef<(() => void) | null>(null);
  const unsubStrokesRef = useRef<(() => void) | null>(null);

  // Subscribe to real-time room changes when activeRoom is set
  useEffect(() => {
    if (!activeRoom) return;

    // Unsubscribe from prior listener if any
    if (unsubRoomRef.current) unsubRoomRef.current();

    unsubRoomRef.current = subscribeToRoom(
      activeRoom.id,
      (updatedRoom) => {
        if (!updatedRoom) {
          // Room was shredded / deleted!
          showToast('Session has ended and was securely shredded from Firebase.', 'info');
          setActiveRoom(null);
          setStrokes([]);
          return;
        }

        if (updatedRoom.status === 'ended') {
          showToast('The study session has concluded.', 'info');
          setActiveRoom(null);
          setStrokes([]);
          return;
        }

        setActiveRoom(updatedRoom);
      },
      (err) => {
        console.warn('Real-time room subscription warning:', err);
      }
    );

    return () => {
      if (unsubRoomRef.current) {
        unsubRoomRef.current();
        unsubRoomRef.current = null;
      }
    };
  }, [activeRoom?.id, showToast]);

  // Subscribe to real-time whiteboard strokes when room is active
  useEffect(() => {
    if (!activeRoom || activeRoom.status !== 'active') return;

    if (unsubStrokesRef.current) unsubStrokesRef.current();

    unsubStrokesRef.current = subscribeToWhiteboardStrokes(
      activeRoom.id,
      (newStrokes) => {
        setStrokes(newStrokes);
      },
      (err) => {
        console.warn('Real-time strokes subscription warning:', err);
      }
    );

    return () => {
      if (unsubStrokesRef.current) {
        unsubStrokesRef.current();
        unsubStrokesRef.current = null;
      }
    };
  }, [activeRoom?.id, activeRoom?.status]);

  // 1. Host creates a room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in with your @ves.ac.in account.', 'warning');
      return;
    }
    if (!createTopic.trim()) {
      showToast('Please provide a study topic.', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const room = await createPeerLearningRoom({
        hostId: user.userId,
        hostName: user.name,
        hostUsername: user.username,
        hostAvatarUrl: user.avatarUrl,
        title: createTopic.trim(),
        subjectCode: createSubject.split(' - ')[0] || 'FEC201',
      });

      setActiveRoom(room);
      showToast(`Study Room created! PIN: ${room.pin}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create study room. Please retry.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Joiner enters PIN and joins
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in with your @ves.ac.in account.', 'warning');
      return;
    }

    const cleanPin = joinPin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanPin.length !== 6) {
      setJoinError('Please enter a valid 6-character room PIN.');
      return;
    }

    setJoinError(null);
    setIsJoining(true);

    try {
      const room = await findRoomByPin(cleanPin);
      if (!room) {
        setJoinError('No active room found with this PIN. Check code or ask host.');
        setIsJoining(false);
        return;
      }

      if (room.hostId === user.userId) {
        setJoinError('You are the host of this room. Reconnecting as host.');
        setActiveRoom(room);
        setIsJoining(false);
        return;
      }

      if (room.joinerId && room.joinerId !== user.userId) {
        setJoinError('Room is full (Strictly 1-on-1: Maximum 2 participants allowed).');
        setIsJoining(false);
        return;
      }

      const res = await joinPeerLearningRoom(room.id, {
        userId: user.userId,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      });

      if (res.success && res.room) {
        setActiveRoom(res.room);
        showToast(res.message, 'success');
      } else {
        setJoinError(res.message);
      }
    } catch (err) {
      console.error(err);
      setJoinError('Failed to join room. Please check your network.');
    } finally {
      setIsJoining(false);
    }
  };

  // 3. Whiteboard action handlers
  const handleAddStroke = async (stroke: WhiteboardStroke) => {
    if (!activeRoom) return;
    await addWhiteboardStroke(activeRoom.id, stroke);
  };

  const handleUndo = async () => {
    if (!activeRoom || !user) return;
    await undoLastStroke(activeRoom.id, strokes, user.userId);
  };

  const handleRedo = async () => {
    if (!activeRoom || !user) return;
    await redoLastStroke(activeRoom.id, strokes, user.userId);
  };

  const handleClear = async () => {
    if (!activeRoom) return;
    await clearWhiteboard(activeRoom.id);
    showToast('Whiteboard cleared for both participants.', 'info');
  };

  const handleLeave = async () => {
    if (!activeRoom || !user) return;
    const isHost = activeRoom.hostId === user.userId;
    await leavePeerLearningRoom(activeRoom.id, user.userId, isHost);
    setActiveRoom(null);
    setStrokes([]);
    showToast('Left study room session.', 'info');
  };

  const handleShredAndEnd = async () => {
    if (!activeRoom) return;
    const roomId = activeRoom.id;
    setActiveRoom(null);
    setStrokes([]);
    await shredAndEndRoom(roomId);
    showToast('Session ended and permanently shredded from Firebase.', 'success');
  };

  const handleCopyPin = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
    showToast(`PIN ${activeRoom.pin} copied to clipboard!`, 'info');
  };

  // =========================================================================
  // VIEW 1: ACTIVE WHITEBOARD SESSION (1-on-1 connected or host drawing)
  // =========================================================================
  if (activeRoom && (activeRoom.status === 'active' || (activeRoom.status === 'waiting' && activeRoom.joinerId))) {
    if (!user) return null;
    return (
      <WhiteboardCanvas
        room={activeRoom}
        currentUser={user}
        strokes={strokes}
        onAddStroke={handleAddStroke}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onLeave={handleLeave}
        onShredAndEnd={handleShredAndEnd}
      />
    );
  }

  // =========================================================================
  // VIEW 2: HOST WAITING ROOM (Waiting for peer to enter the PIN)
  // =========================================================================
  if (activeRoom && activeRoom.status === 'waiting' && activeRoom.hostId === user?.userId) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 p-8 shadow-xl text-center space-y-6">
          {/* Radar animation */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-orange-300 opacity-30 animate-pulse" />
            <div className="w-16 h-16 rounded-3xl bg-[#F97316] text-white flex items-center justify-center font-black text-2xl shadow-md z-10">
              📡
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#F97316] dark:bg-orange-950 dark:text-orange-300">
              1-on-1 Collaborative Study Room Created
            </span>
            <h2 className="text-2xl font-black text-[#171916] dark:text-neutral-100 tracking-tight">
              Waiting for Peer to Join...
            </h2>
            <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              Share the 6-character room PIN with your classmate. As soon as they enter it, both of you will transition immediately into the live shared whiteboard.
            </p>
          </div>

          {/* Large 6-Character PIN Display Box */}
          <div className="p-6 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border-2 border-dashed border-[#F97316] max-w-md mx-auto space-y-3">
            <div className="text-[11px] font-bold text-[#737871] uppercase tracking-wider">
              Your Unique Room PIN
            </div>

            <div className="flex items-center justify-center gap-2">
              {activeRoom.pin.split('').map((char, i) => (
                <span
                  key={i}
                  className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl bg-white dark:bg-neutral-900 border border-orange-300 dark:border-orange-700 text-2xl sm:text-3xl font-black font-mono text-[#F97316] flex items-center justify-center shadow-xs"
                >
                  {char}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyPin}
              className="py-2 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              {copiedPin ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              <span>{copiedPin ? 'PIN Copied!' : 'Copy Room PIN'}</span>
            </button>
          </div>

          {/* Session Details */}
          <div className="flex items-center justify-center gap-6 text-xs text-[#737871] pt-2 border-t border-[#E5E3DC] dark:border-neutral-800">
            <div>
              <span className="font-semibold">Topic:</span>{' '}
              <strong className="text-[#171916] dark:text-neutral-200">{activeRoom.title}</strong>
            </div>
            <div>
              <span className="font-semibold">Subject:</span>{' '}
              <strong className="text-[#171916] dark:text-neutral-200">{activeRoom.subjectCode}</strong>
            </div>
          </div>

          {/* Cancel or Shred Room */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleShredAndEnd}
              className="px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" />
              <span>Cancel & Shred Room</span>
            </button>

            {/* Direct Whiteboard preview button for host */}
            <button
              type="button"
              onClick={() => setActiveRoom({ ...activeRoom, status: 'active' })}
              className="px-4 py-2.5 rounded-xl bg-[#171916] dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Enter Whiteboard Solo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: LOBBY (Create Room or Join with PIN)
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-[#FAF9F5] to-amber-500/10 dark:from-orange-950/30 dark:via-neutral-900 dark:to-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 p-6 sm:p-9 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#F97316] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-on-1 Peer Collaborative Study Rooms</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171916] dark:text-neutral-100 tracking-tight">
              Real-Time Collaborative Whiteboard
            </h1>
            <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 max-w-2xl leading-relaxed">
              Connect with another student using a private 6-character PIN. Draw equations, explain tough engineering concepts, solve textbook problems, and brainstorm together on a live interactive digital whiteboard.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs font-mono font-bold text-[#171916] dark:text-neutral-200 shadow-2xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strictly 1 Host + 1 Joiner</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN SPLIT: Create Room (Left) & Join Room with PIN (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* CARD 1: CREATE 1-ON-1 STUDY ROOM */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-[#F97316] flex items-center justify-center font-black text-lg shadow-2xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#171916] dark:text-neutral-100">
                Create a Study Room
              </h2>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                Generate a unique 6-character PIN and invite your peer to collaborate.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171916] dark:text-neutral-200 mb-1.5">
                Study Topic / Problem <span className="text-[#F97316]">*</span>
              </label>
              <input
                type="text"
                required
                value={createTopic}
                onChange={(e) => setCreateTopic(e.target.value)}
                placeholder="e.g. C++ Pointers & Memory Allocation, Linear Algebra..."
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171916] dark:text-neutral-200 mb-1.5">
                Subject Course
              </label>
              <select
                value={createSubject}
                onChange={(e) => setCreateSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316] transition-all"
              >
                <option value="FEC205 - C++ Programming">FEC205 - C++ Programming</option>
                <option value="FEC201 - Applied Mathematics II">FEC201 - Applied Mathematics II</option>
                <option value="FEC202 - Applied Physics II">FEC202 - Applied Physics II</option>
                <option value="FEC203 - Applied Chemistry II">FEC203 - Applied Chemistry II</option>
                <option value="FEC204 - Engineering Graphics & CAD">FEC204 - Engineering Graphics & CAD</option>
                <option value="ECC302 - Digital System Design">ECC302 - Digital System Design</option>
                <option value="CSC303 - Discrete Structures & Graph Theory">CSC303 - Discrete Structures & Graph Theory</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-xs text-[#555952] dark:text-neutral-300 space-y-1">
              <div className="font-bold text-[#F97316] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Connection-Based Ephemeral Privacy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                When you finish teaching, you can shred the meeting; all records and whiteboard strokes are permanently removed from Firebase.
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isCreating ? 'Generating Room PIN...' : 'Create 1-on-1 Room & Generate PIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* CARD 2: JOIN WITH ROOM PIN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-lg shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#171916] dark:text-neutral-100">
                Join a Room with PIN
              </h2>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                Enter the 6-character code provided by your peer to connect.
              </p>
            </div>
          </div>

          {joinError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{joinError}</span>
            </div>
          )}

          <form onSubmit={handleJoinRoom} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171916] dark:text-neutral-200 mb-1.5">
                6-Character Room PIN <span className="text-[#F97316]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={joinPin}
                  onChange={(e) => {
                    setJoinPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setJoinError(null);
                  }}
                  placeholder="e.g. 8F3K9A"
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-lg font-black font-mono tracking-widest text-[#171916] dark:text-neutral-100 uppercase text-center focus:outline-none focus:border-[#F97316] transition-all"
                />
              </div>
              <div className="text-[11px] text-[#737871] dark:text-neutral-400 mt-1.5 text-center">
                Whitespace & lowercase letters are automatically formatted.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 text-xs text-[#555952] dark:text-neutral-400 space-y-1.5">
              <div className="font-bold text-[#171916] dark:text-neutral-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Collaboration Features</span>
              </div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 text-[#737871] dark:text-neutral-400">
                <li>Instant drawing sync with Pen, Pencil, and Marker tools.</li>
                <li>Shared eraser, undo, redo, and synchronized board clearing.</li>
                <li>Strictly two students per room: guaranteed 1-on-1 focus.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isJoining || joinPin.trim().length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#171916] dark:bg-neutral-100 hover:bg-black dark:hover:bg-white text-white dark:text-neutral-900 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isJoining ? 'Connecting to Room...' : 'Join 1-on-1 Whiteboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
