import React, { useState, useMemo } from 'react';
import { Team, Player, TrainingPlan, Session, Attendance, BehaviorEntry, SessionType, BehaviorStatus, BehaviorTag, Drill, SessionFocus, PlanDrill } from '../types';
import { Card, Button, Modal } from './common';
import { BEHAVIOR_STATUS_CONFIG } from '../constants';
import { CheckCircleIcon, ChevronRightIcon, ArrowPathIcon } from './Icons';

type SessionStage = 'create' | 'active' | 'summary';

const BehaviorTracker: React.FC<{
    player: Player;
    attendance: Attendance;
    behavior: BehaviorEntry;
    onToggleAttendance: (playerId: string) => void;
    onUpdateBehavior: (playerId: string, status: BehaviorStatus) => void;
}> = ({ player, attendance, behavior, onToggleAttendance, onUpdateBehavior }) => {
    
    const cycleBehavior = () => {
        const statuses = [BehaviorStatus.Green, BehaviorStatus.Yellow, BehaviorStatus.Red, BehaviorStatus.None];
        const currentIndex = statuses.indexOf(behavior.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        onUpdateBehavior(player.id, statuses[nextIndex]);
    };
    
    const behaviorConfig = BEHAVIOR_STATUS_CONFIG[behavior.status];

    return (
        <div className={`p-3 rounded-lg flex items-center justify-between transition-all ${!attendance.present ? 'opacity-40 bg-gray-100' : 'bg-white'}`}>
            <div className="flex items-center space-x-3">
                <input type="checkbox" checked={attendance.present} onChange={() => onToggleAttendance(player.id)} className="h-5 w-5 rounded text-brand-blue focus:ring-brand-blue" />
                <span className="font-medium text-gray-800">{player.name}</span>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={cycleBehavior} 
                    disabled={!attendance.present}
                    className={`w-24 text-center py-2 rounded-md font-semibold text-sm shadow-sm ${behaviorConfig.color} ${behaviorConfig.text} transition-colors`}
                >
                    {behaviorConfig.label}
                </button>
            </div>
        </div>
    );
};

export const SessionManager: React.FC<{
    teams: Team[];
    players: Player[];
    drills: Drill[];
    plans: TrainingPlan[];
    onSessionComplete: (session: Session, attendances: Attendance[], behaviors: BehaviorEntry[]) => void;
    addPlan: (plan: Omit<TrainingPlan, 'id'>) => TrainingPlan;
}> = ({ teams, players, drills, plans, onSessionComplete, addPlan }) => {
    const [stage, setStage] = useState<SessionStage>('create');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [sessionFocus, setSessionFocus] = useState<string>(SessionFocus.Dribbling);
    const [sessionDrills, setSessionDrills] = useState<PlanDrill[]>([]);
    
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [behaviors, setBehaviors] = useState<BehaviorEntry[]>([]);
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);

    const teamPlayers = useMemo(() => players.filter(p => p.teamId === selectedTeamId), [players, selectedTeamId]);
    
    const handleAddDrillToSession = (drillId: string) => {
      const drill = drills.find(d => d.id === drillId);
      if (drill && !sessionDrills.find(pd => pd.drillId === drillId)) {
          setSessionDrills([...sessionDrills, { drillId, duration: drill.duration }]);
      }
    };

    const handleRemoveDrillFromSession = (drillId: string) => {
        setSessionDrills(sessionDrills.filter(pd => pd.drillId !== drillId));
    }


    const handleStartSession = () => {
        if (!selectedTeamId || sessionDrills.length === 0) return;

        const tempPlan: Omit<TrainingPlan, 'id'> = {
            name: `Session Plan - ${new Date().toLocaleDateString()}`,
            theme: sessionFocus || 'General Session',
            drills: sessionDrills,
        };
        const newPlan = addPlan(tempPlan);

        const newSession: Session = {
            id: `s${Date.now()}`,
            teamId: selectedTeamId,
            trainingPlanId: newPlan.id,
            dateTime: new Date().toISOString(),
            type: SessionType.Training,
            focus: sessionFocus,
        };

        setCurrentSession(newSession);
        setAttendances(teamPlayers.map(p => ({ sessionId: newSession.id, playerId: p.id, present: true })));
        setBehaviors(teamPlayers.map(p => ({ sessionId: newSession.id, playerId: p.id, status: BehaviorStatus.Green, tags: [] })));
        setCurrentDrillIndex(0);
        setStage('active');
    };

    const handleFinishSession = () => {
        if (!currentSession) return;
        onSessionComplete(currentSession, attendances, behaviors);
        setStage('summary');
    }
    
    const resetSession = () => {
        setStage('create');
        setSelectedTeamId(null);
        setSessionFocus(SessionFocus.Dribbling);
        setSessionDrills([]);
        setCurrentSession(null);
        setAttendances([]);
        setBehaviors([]);
    }

    const handleToggleAttendance = (playerId: string) => {
        setAttendances(attendances.map(a => a.playerId === playerId ? { ...a, present: !a.present } : a));
    };

    const handleUpdateBehavior = (playerId: string, status: BehaviorStatus) => {
        setBehaviors(behaviors.map(b => b.playerId === playerId ? { ...b, status } : b));
    };

    if (stage === 'create') {
        return (
            <Card className="max-w-2xl mx-auto my-8">
                <h2 className="text-2xl font-bold text-brand-blue mb-6">Create New Session</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Select Team</label>
                        <select onChange={e => setSelectedTeamId(e.target.value)} defaultValue="" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue">
                            <option value="" disabled>Select a team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Session Focus</label>
                        <select value={sessionFocus} onChange={e => setSessionFocus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue">
                             {Object.values(SessionFocus).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">3. Build Session Plan</label>
                      <div className="space-y-2 p-2 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <h4 className="font-semibold text-sm text-gray-800">Selected Drills ({sessionDrills.length})</h4>
                          {sessionDrills.map(pd => {
                              const drill = drills.find(d => d.id === pd.drillId);
                              return <div key={pd.drillId} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                  <span>{drill?.name}</span>
                                  <button type="button" onClick={() => handleRemoveDrillFromSession(pd.drillId)} className="text-red-500 text-xs font-semibold">REMOVE</button>
                              </div>
                          })}
                          {sessionDrills.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Add drills from the list below.</p>}
                      </div>
                      
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-md">
                          {drills.map(drill => (
                              <div key={drill.id} className="flex justify-between items-center p-2 border-b">
                                  <div>
                                      <p className="font-semibold">{drill.name}</p>
                                      <p className="text-xs text-gray-500">{drill.category} - {drill.duration} min</p>
                                  </div>
                                  <Button type="button" variant="secondary" onClick={() => handleAddDrillToSession(drill.id)} disabled={!selectedTeamId || !!sessionDrills.find(pd => pd.drillId === drill.id)}>Add</Button>
                              </div>
                          ))}
                      </div>
                    </div>
                    <Button onClick={handleStartSession} disabled={!selectedTeamId || sessionDrills.length === 0} className="w-full">Start Session</Button>
                </div>
            </Card>
        );
    }
    
    const activeSessionPlan = plans.find(p => p.id === currentSession?.trainingPlanId);
    if (stage === 'active' && activeSessionPlan) {
        const currentPlanDrill = activeSessionPlan.drills[currentDrillIndex];
        const currentDrill = drills.find(d => d.id === currentPlanDrill.drillId);
        
        return (
            <div className="p-4 max-w-3xl mx-auto">
                <Card className="mb-4">
                    <p className="text-sm text-gray-500">Current Drill ({currentDrillIndex + 1}/{activeSessionPlan.drills.length})</p>
                    <h2 className="text-xl font-bold text-brand-blue">{currentDrill?.name}</h2>
                    <p className="text-gray-600">{currentDrill?.description}</p>
                </Card>
                <div className="space-y-2">
                    {teamPlayers.map(player => (
                        <BehaviorTracker 
                            key={player.id}
                            player={player}
                            attendance={attendances.find(a => a.playerId === player.id)!}
                            behavior={behaviors.find(b => b.playerId === player.id)!}
                            onToggleAttendance={handleToggleAttendance}
                            onUpdateBehavior={handleUpdateBehavior}
                        />
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <Button variant="danger" onClick={handleFinishSession}>Finish Session</Button>
                    <Button onClick={() => setCurrentDrillIndex(i => Math.min(i + 1, activeSessionPlan.drills.length - 1))} disabled={currentDrillIndex >= activeSessionPlan.drills.length - 1}>
                        Next Drill <ChevronRightIcon className="w-5 h-5 inline"/>
                    </Button>
                </div>
            </div>
        )
    }

    if (stage === 'summary') {
        const presentCount = attendances.filter(a => a.present).length;
        const totalCount = attendances.length;
        return (
            <Card className="max-w-2xl mx-auto my-8 text-center">
                <CheckCircleIcon className="w-16 h-16 text-status-green mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-brand-blue mb-2">Session Complete!</h2>
                <p className="text-gray-600 mb-4">Attendance: {presentCount} / {totalCount} players</p>
                <div className="text-left space-y-2 my-4">
                    <h3 className="font-semibold">Behavior Summary:</h3>
                    {behaviors.map(b => {
                        const player = players.find(p => p.id === b.playerId);
                        const config = BEHAVIOR_STATUS_CONFIG[b.status];
                        return (
                            <div key={b.playerId} className="flex items-center justify-between">
                                <span>{player?.name}</span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color} ${config.text}`}>{config.label}</span>
                            </div>
                        )
                    })}
                </div>
                <Button onClick={resetSession}>
                   <ArrowPathIcon className="w-5 h-5 inline mr-2"/> New Session
                </Button>
            </Card>
        )
    }

    return null;
};