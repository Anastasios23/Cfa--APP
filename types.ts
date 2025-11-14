
export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  coach: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  dob: string;
  notes: string;
}

export enum SessionType {
  Training = 'Training',
  Match = 'Match',
  Event = 'Event',
}

export interface Session {
  id: string;
  teamId: string;
  dateTime: string;
  type: SessionType;
  focus: string;
  trainingPlanId: string;
  notes?: string;
}

export enum BehaviorStatus {
  None = 'None',
  Green = 'Green',
  Yellow = 'Yellow',
  Red = 'Red',
}

export enum BehaviorTag {
  Listening = 'Listening',
  Respect = 'Respect',
  Effort = 'Effort',
  Aggression = 'Aggression',
  Distraction = 'Distraction',
}

export interface BehaviorEntry {
  sessionId: string;
  playerId: string;
  status: BehaviorStatus;
  tags: BehaviorTag[];
  note?: string;
}

export interface Attendance {
  sessionId: string;
  playerId: string;
  present: boolean;
}

export enum DrillCategory {
  Technical = 'Technical',
  Physical = 'Physical',
  Social = 'Social/Values',
}

export interface Drill {
  id: string;
  name: string;
  ageGroups: string[];
  category: DrillCategory;
  description: string;
  duration: number; // in minutes
  equipment: string[];
  tags: string[];
  videoUrl?: string;
  setup: string;
  instructions: string;
}

export interface PlanDrill {
  drillId: string;
  duration: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  theme: string;
  drills: PlanDrill[];
}

export type AppState = {
  teams: Team[];
  players: Player[];
  sessions: Session[];
  behaviorEntries: BehaviorEntry[];
  attendances: Attendance[];
  drills: Drill[];
  trainingPlans: TrainingPlan[];
};

export type View = 'dashboard' | 'session' | 'drills' | 'plans' | 'teams';

export enum SessionFocus {
  Dribbling = 'Dribbling',
  Passing = 'Passing',
  Shooting = 'Shooting',
  Defending = 'Defending',
  Coordination = 'Coordination',
  Teamwork = 'Teamwork',
  Values = 'Social/Values',
  General = 'General Fitness',
}