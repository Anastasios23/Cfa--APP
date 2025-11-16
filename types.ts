// ============================================
// USER ROLES
// ============================================
export enum UserRole {
  Coach = "Coach",
  HeadCoach = "HeadCoach",
  Admin = "Admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Note: For now, all users have the same access to everything
  // Future: Can be extended with permissions and team assignments
}

// ============================================
// CORE ENTITIES
// ============================================

// Team: A group of players managed by coach(es)
export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  coach: string; // Coach name or ID
}

// Player: An individual athlete in a team
export interface Player {
  id: string;
  name: string;
  teamId: string; // FK: Belongs to a Team
  dob: string;
  notes: string;
}

export enum SessionType {
  Training = "Training",
  Match = "Match",
  Event = "Event",
}

// Session: A training session or match for a team
export interface Session {
  id: string;
  teamId: string; // FK: Belongs to a Team
  dateTime: string;
  type: SessionType;
  focus: string;
  trainingPlanId: string; // FK: Can reference a Training Plan
  notes?: string;
}

export enum BehaviorStatus {
  None = "None",
  Green = "Green",
  Yellow = "Yellow",
  Red = "Red",
}

export enum BehaviorTag {
  Listening = "Listening",
  Respect = "Respect",
  Effort = "Effort",
  Aggression = "Aggression",
  Distraction = "Distraction",
}

// Behavior Record: Player behavior during a specific session
// PK: (sessionId, playerId)
export interface BehaviorEntry {
  sessionId: string; // FK: Belongs to a Session
  playerId: string; // FK: Belongs to a Player
  status: BehaviorStatus;
  tags: BehaviorTag[];
  note?: string;
}

export interface Attendance {
  sessionId: string; // FK: Belongs to a Session
  playerId: string; // FK: Belongs to a Player
  present: boolean;
}

export enum DrillCategory {
  Technical = "Technical",
  Physical = "Physical",
  Social = "Social/Values",
}

// Drill: A reusable training drill/exercise
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

// PlanDrill: Association between a Training Plan and a Drill
export interface PlanDrill {
  drillId: string; // FK: References a Drill
  duration: number;
}

// Training Plan: A structured plan containing multiple drills
export interface TrainingPlan {
  id: string;
  name: string;
  theme: string;
  drills: PlanDrill[];
}

export type AppState = {
  users?: User[]; // Optional: For future authentication/user management
  teams: Team[];
  players: Player[];
  sessions: Session[];
  behaviorEntries: BehaviorEntry[];
  attendances: Attendance[];
  drills: Drill[];
  trainingPlans: TrainingPlan[];
};

export type View = "dashboard" | "session" | "drills" | "plans" | "teams";

export enum SessionFocus {
  Dribbling = "Dribbling",
  Passing = "Passing",
  Shooting = "Shooting",
  Defending = "Defending",
  Coordination = "Coordination",
  Teamwork = "Teamwork",
  Values = "Social/Values",
  General = "General Fitness",
}
