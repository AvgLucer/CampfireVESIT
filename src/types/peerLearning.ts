export type WhiteboardTool = 'pen' | 'pencil' | 'marker' | 'eraser';

export interface WhiteboardPoint {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
}

export interface WhiteboardStroke {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  tool: WhiteboardTool;
  color: string;
  width: number; // Base stroke width
  points: WhiteboardPoint[];
  createdAt: string;
  isUndone?: boolean;
}

export type RoomStatus = 'waiting' | 'active' | 'ended' | 'expired';

export interface PeerLearningRoom {
  id: string;
  pin: string; // 6-character unique alphanumeric PIN (e.g. "8F3K9A")
  title: string;
  subjectCode: string;
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostAvatarUrl?: string | null;
  joinerId?: string | null;
  joinerName?: string | null;
  joinerUsername?: string | null;
  joinerAvatarUrl?: string | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  endedAt?: string | null;
  clearedAt?: string | null;
}
