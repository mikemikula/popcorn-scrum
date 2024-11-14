export interface Card {
  id: number;
  title: string;
  sequence: number;
  completed: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimerState {
  isTiming: boolean;
  startTime?: Date;
} 