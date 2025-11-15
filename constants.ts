
import { AppState, DrillCategory, SessionType, BehaviorStatus, BehaviorTag } from './types';

export const MOCK_DATA: AppState = {
  teams: [
    { id: 't1', name: 'U6 Lions', ageGroup: 'U5-U6', coach: 'Coach Bob' },
    { id: 't2', name: 'U8 Tigers', ageGroup: 'U7-U8', coach: 'Coach Alice' },
  ],
  players: [
    { id: 'p1', name: 'Sam Jones', teamId: 't1', dob: '2018-05-10', notes: 'Very energetic' },
    { id: 'p2', name: 'Mia Wong', teamId: 't1', dob: '2018-08-22', notes: 'Shy at first' },
    { id: 'p3', name: 'Leo Smith', teamId: 't1', dob: '2018-03-15', notes: '' },
    { id: 'p4', name: 'Ava Chen', teamId: 't2', dob: '2016-06-01', notes: 'Good leader' },
    { id: 'p5', name: 'Noah Brown', teamId: 't2', dob: '2016-09-12', notes: 'Needs encouragement' },
  ],
  drills: [
    { 
      id: 'd1', 
      name: 'Dribbling Gates', 
      ageGroups: ['U5-U6', 'U7-U8'], 
      category: DrillCategory.Technical, 
      description: 'Players dribble through various cone gates to improve close control and awareness.', 
      duration: 10, 
      equipment: ['Cones', 'Balls'], 
      tags: ['dribbling', 'warm-up'], 
      videoUrl: 'https://www.youtube.com/embed/U-x_kSst_4E',
      setup: 'Create a 10x10 yard grid. Inside the grid, set up 5-7 "gates" using two cones spaced about 2 feet apart.',
      instructions: 'Players dribble inside the area. The aim is to dribble through as many gates as possible in 60 seconds. Encourage players to keep their head up to see the gates and other players. After each round, ask them to try and beat their score.'
    },
    { 
      id: 'd2', 
      name: 'Red Light, Green Light', 
      ageGroups: ['U5-U6'], 
      category: DrillCategory.Social, 
      description: 'A fun game to practice starting and stopping with the ball based on the coach\'s command.', 
      duration: 5, 
      equipment: ['Balls'], 
      tags: ['listening', 'fun'],
      setup: 'Players line up on one end of the field, each with a ball.',
      instructions: 'When the coach yells "Green Light!", players dribble towards the other end. When the coach yells "Red Light!", players must stop their ball as quickly as possible. This teaches listening skills and ball control.'
    },
    { 
      id: 'd3', 
      name: '1v1 to Goal', 
      ageGroups: ['U7-U8'], 
      category: DrillCategory.Technical, 
      description: 'Players compete one-on-one to score in a small goal, focusing on attacking and defending skills.', 
      duration: 15, 
      equipment: ['Balls', 'Small Goals'], 
      tags: ['1v1', 'shooting'],
      setup: 'Set up two small goals about 15-20 yards apart. Players form two lines, one by each goal. The first player in one line starts with the ball.',
      instructions: 'The player with the ball (attacker) tries to score on the opposite goal. The first player from the other line acts as the defender. After the play is over (goal or ball out of bounds), they switch roles. Focus on encouraging creativity from the attacker and good defensive posture.'
    },
  ],
  trainingPlans: [
    { id: 'tp1', name: 'U6 Fun & Dribbling', theme: 'Ball mastery & listening', drills: [{ drillId: 'd2', duration: 5 }, { drillId: 'd1', duration: 10 }] },
    { id: 'tp2', name: 'U8 Competitive Intro', theme: '1v1 and respect in duels', drills: [{ drillId: 'd1', duration: 10 }, { drillId: 'd3', duration: 15 }] },
  ],
  sessions: [
    { id: 's1', teamId: 't1', dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: SessionType.Training, focus: 'Dribbling', trainingPlanId: 'tp1', notes: 'Great energy from the team today. Everyone was focused during the dribbling drills.' }
  ],
  behaviorEntries: [
    { sessionId: 's1', playerId: 'p1', status: BehaviorStatus.Green, tags: [BehaviorTag.Effort] },
    { sessionId: 's1', playerId: 'p2', status: BehaviorStatus.Yellow, tags: [BehaviorTag.Distraction], note: 'Was talking a lot at the start.' },
    { sessionId: 's1', playerId: 'p3', status: BehaviorStatus.Green, tags: [] },
  ],
  attendances: [
    { sessionId: 's1', playerId: 'p1', present: true },
    { sessionId: 's1', playerId: 'p2', present: true },
    { sessionId: 's1', playerId: 'p3', present: true },
  ],
};

export const BEHAVIOR_STATUS_CONFIG = {
  [BehaviorStatus.None]: { color: 'bg-gray-200', text: 'text-gray-600', label: 'None' },
  [BehaviorStatus.Green]: { color: 'bg-status-green', text: 'text-white', label: 'Green' },
  [BehaviorStatus.Yellow]: { color: 'bg-status-yellow', text: 'text-white', label: 'Yellow' },
  [BehaviorStatus.Red]: { color: 'bg-status-red', text: 'text-white', label: 'Red' },
};