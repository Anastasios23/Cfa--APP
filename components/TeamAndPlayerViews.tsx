import React, { useState } from 'react';
import { Team, Player, AppState, BehaviorStatus, Session } from '../types';
import { Card, Button, Modal } from './common';
import { BEHAVIOR_STATUS_CONFIG } from '../constants';
import { PlusIcon, PencilIcon, UserPlusIcon, TrashIcon, ClockIcon, EyeIcon } from './Icons';

const PlayerProfile: React.FC<{
  player: Player;
  allData: AppState;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ player, allData, onEdit, onDelete }) => {
  // Get all sessions for the player's team, sorted from most recent to oldest
  const teamSessions = allData.sessions
    .filter(s => s.teamId === player.teamId)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-brand-blue">{player.name}</h3>
          <p className="text-sm text-gray-500">DOB: {player.dob}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {player.notes && <p className="mt-2 text-gray-700 italic">Notes: {player.notes}</p>}
      
      <div className="mt-6">
        <h4 className="font-semibold text-lg text-brand-blue">Full Session History</h4>
        <div className="space-y-3 mt-2 max-h-80 overflow-y-auto pr-2">
          {teamSessions.length > 0 ? teamSessions.map(session => {
            const attendance = allData.attendances.find(a => a.sessionId === session.id && a.playerId === player.id);
            const behavior = allData.behaviorEntries.find(b => b.sessionId === session.id && b.playerId === player.id);
            
            return (
              <div key={session.id} className="bg-gray-50 p-3 rounded-md border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{new Date(session.dateTime).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{session.focus}</p>
                  </div>
                  <div>
                    {!attendance || !attendance.present ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">Absent</span>
                    ) : behavior ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${BEHAVIOR_STATUS_CONFIG[behavior.status].color} ${BEHAVIOR_STATUS_CONFIG[behavior.status].text}`}>
                        {BEHAVIOR_STATUS_CONFIG[behavior.status].label}
                      </span>
                    ) : null}
                  </div>
                </div>
                {attendance?.present && behavior?.note && (
                  <p className="mt-2 text-sm text-gray-700 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                    <span className="font-semibold">Note:</span> {behavior.note}
                  </p>
                )}
              </div>
            )
          }) : <p className="text-sm text-gray-500">No session history yet.</p>}
        </div>
      </div>
    </Card>
  );
};

const SessionDetails: React.FC<{ session: Session; allData: AppState }> = ({ session, allData }) => {
    const plan = allData.trainingPlans.find(p => p.id === session.trainingPlanId);
    const teamPlayers = allData.players.filter(p => p.teamId === session.teamId);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-lg text-brand-blue">{session.focus}</h3>
                <p className="text-sm text-gray-500">Plan: {plan?.name || 'Custom Session Plan'}</p>
            </div>
            {session.notes && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <h4 className="font-semibold text-gray-800">Coach's Notes</h4>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{session.notes}</p>
                </div>
            )}
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Player Summary</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {teamPlayers.map(player => {
                        const attendance = allData.attendances.find(a => a.sessionId === session.id && a.playerId === player.id);
                        const behavior = allData.behaviorEntries.find(b => b.sessionId === session.id && b.playerId === player.id);
                        return (
                            <div key={player.id} className="bg-gray-50 p-2 rounded-md border">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{player.name}</p>
                                    <div>
                                        {!attendance || !attendance.present ? (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">Absent</span>
                                        ) : behavior ? (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${BEHAVIOR_STATUS_CONFIG[behavior.status].color} ${BEHAVIOR_STATUS_CONFIG[behavior.status].text}`}>
                                                {BEHAVIOR_STATUS_CONFIG[behavior.status].label}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                 {attendance?.present && behavior?.note && (
                                    <p className="mt-2 text-xs text-gray-600 bg-white p-1.5 rounded">
                                        <span className="font-semibold">Note:</span> {behavior.note}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


const TeamSessionViewer: React.FC<{ team: Team; allData: AppState; onViewSession: (session: Session) => void }> = ({ team, allData, onViewSession }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const teamSessions = allData.sessions
    .filter(s => s.teamId === team.id)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const filteredSessions = teamSessions.filter(session => {
    const sessionDate = new Date(session.dateTime);
    sessionDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (sessionDate < start) return false;
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        if (sessionDate > end) return false;
    }
    return true;
  });
  
  return (
    <Card className="mt-6">
      <h2 className="text-2xl font-bold text-brand-blue mb-4 flex items-center">
        <ClockIcon className="w-6 h-6 mr-2" />
        Session History for {team.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {filteredSessions.map(session => {
            const plan = allData.trainingPlans.find(p => p.id === session.trainingPlanId);
            const sessionBehaviors = allData.behaviorEntries.filter(b => b.sessionId === session.id);
            const behaviorCounts = sessionBehaviors.reduce((acc, b) => {
              acc[b.status] = (acc[b.status] || 0) + 1;
              return acc;
            }, {} as Record<BehaviorStatus, number>);

            return (
              <div key={session.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-brand-blue">{new Date(session.dateTime).toLocaleDateString()} - {session.focus}</h3>
                    <p className="text-sm text-gray-600">Plan: {plan?.name || 'Custom Session Plan'}</p>
                     <div className="flex space-x-2 items-center text-xs font-medium mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-white ${BEHAVIOR_STATUS_CONFIG[BehaviorStatus.Green].color}`}>
                        G: {behaviorCounts[BehaviorStatus.Green] || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-white ${BEHAVIOR_STATUS_CONFIG[BehaviorStatus.Yellow].color}`}>
                        Y: {behaviorCounts[BehaviorStatus.Yellow] || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-white ${BEHAVIOR_STATUS_CONFIG[BehaviorStatus.Red].color}`}>
                        R: {behaviorCounts[BehaviorStatus.Red] || 0}
                      </span>
                    </div>
                  </div>
                   <button onClick={() => onViewSession(session)} className="text-brand-blue hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100 flex items-center space-x-1 text-sm font-semibold">
                        <EyeIcon className="w-5 h-5"/> <span>Details</span>
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No session history found for this team or selected date range.</p>
      )}
    </Card>
  );
};


const TeamForm: React.FC<{
  onSave: (team: Omit<Team, 'id'> | Team) => void;
  onClose: () => void;
  initialTeam?: Team;
}> = ({ onSave, onClose, initialTeam }) => {
  const [name, setName] = useState(initialTeam?.name || '');
  const [ageGroup, setAgeGroup] = useState(initialTeam?.ageGroup || '');
  const [coach, setCoach] = useState(initialTeam?.coach || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ageGroup || !coach) return;
    const teamData = { name, ageGroup, coach };
    if (initialTeam) {
      onSave({ ...initialTeam, ...teamData });
    } else {
      onSave(teamData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Team Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Age Group</label>
        <input type="text" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} placeholder="e.g. U7-U8" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Coach Name</label>
        <input type="text" value={coach} onChange={(e) => setCoach(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Team</Button>
      </div>
    </form>
  );
};

const PlayerForm: React.FC<{
  onSave: (player: Omit<Player, 'id'> | Player) => void;
  onClose: () => void;
  teamId: string;
  initialPlayer?: Player | null;
}> = ({ onSave, onClose, teamId, initialPlayer }) => {
  const [name, setName] = useState(initialPlayer?.name || '');
  const [dob, setDob] = useState(initialPlayer?.dob || '');
  const [notes, setNotes] = useState(initialPlayer?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    const playerData = { name, dob, notes, teamId };
    if (initialPlayer) {
      onSave({ ...initialPlayer, ...playerData });
    } else {
      onSave(playerData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Player Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Player</Button>
      </div>
    </form>
  );
};

interface TeamAndPlayerViewsProps {
    allData: AppState;
    addTeam: (team: Omit<Team, 'id'>) => void;
    updateTeam: (team: Team) => void;
    addPlayer: (player: Omit<Player, 'id'>) => void;
    updatePlayer: (player: Player) => void;
    removePlayer: (playerId: string) => void;
}

export const TeamAndPlayerViews: React.FC<TeamAndPlayerViewsProps> = ({ 
  allData, addTeam, updateTeam, addPlayer, updatePlayer, removePlayer 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(allData.teams[0] || null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  
  const teamPlayers = allData.players.filter(p => p.teamId === selectedTeam?.id);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeam(allData.teams.find(t => t.id === teamId) || null);
    setSelectedPlayer(null);
  };
  
  const handleSaveTeam = (teamData: Omit<Team, 'id'> | Team) => {
    if ('id' in teamData) {
      updateTeam(teamData);
      if (selectedTeam?.id === teamData.id) {
        setSelectedTeam(teamData);
      }
    } else {
      addTeam(teamData);
    }
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id'> | Player) => {
    if ('id' in playerData) {
      updatePlayer(playerData as Player);
      if (selectedPlayer?.id === playerData.id) {
        setSelectedPlayer(playerData as Player);
      }
    } else {
      addPlayer(playerData);
    }
  };
  
  const handleDeletePlayer = () => {
    if (selectedPlayer) {
      removePlayer(selectedPlayer.id);
      setSelectedPlayer(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  const closePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setEditingPlayer(null);
  };
  
  const closeTeamModal = () => {
    setIsTeamModalOpen(false);
    setEditingTeam(null);
  };

  return (
    <div className="p-4 space-y-6">
      <Modal isOpen={isTeamModalOpen || !!editingTeam} onClose={closeTeamModal} title={editingTeam ? 'Edit Team' : 'Create New Team'}>
        <TeamForm onSave={handleSaveTeam} onClose={closeTeamModal} initialTeam={editingTeam!} />
      </Modal>

      <Modal isOpen={isPlayerModalOpen} onClose={closePlayerModal} title={editingPlayer ? 'Edit Player' : 'Add New Player'}>
        {selectedTeam && <PlayerForm onSave={handleSavePlayer} onClose={closePlayerModal} teamId={selectedTeam.id} initialPlayer={editingPlayer} />}
      </Modal>

      <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirm Deletion">
        <div>
          <p className="text-gray-700">Are you sure you want to remove {selectedPlayer?.name}? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeletePlayer}>Delete Player</Button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={!!viewingSession} onClose={() => setViewingSession(null)} title={`Session Details: ${new Date(viewingSession?.dateTime || '').toLocaleDateString()}`}>
          {viewingSession && <SessionDetails session={viewingSession} allData={allData} />}
      </Modal>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {allData.teams.map(team => (
          <button
            key={team.id}
            onClick={() => handleSelectTeam(team.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0 ${selectedTeam?.id === team.id ? 'bg-brand-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
          >
            {team.name}
          </button>
        ))}
        <Button onClick={() => { setEditingTeam(null); setIsTeamModalOpen(true); }} variant="secondary">
          <PlusIcon className="w-5 h-5 inline" />
        </Button>
      </div>

      {selectedTeam && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-brand-blue">{selectedTeam.name}</h2>
                  <button onClick={() => setEditingTeam(selectedTeam)} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{selectedTeam.ageGroup} - Coached by {selectedTeam.coach}</p>
                
                <Button onClick={() => { setEditingPlayer(null); setIsPlayerModalOpen(true); }} className="w-full mb-4 flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 mr-2" /> Add Player
                </Button>
                
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {teamPlayers.map(player => (
                    <li key={player.id}>
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${selectedPlayer?.id === player.id ? 'bg-brand-accent text-brand-blue font-semibold' : 'hover:bg-gray-100'}`}
                      >
                        {player.name}
                      </button>
                    </li>
                  ))}
                  {teamPlayers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No players on this team yet.</p>}
                </ul>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedPlayer ? (
                <PlayerProfile 
                  player={selectedPlayer} 
                  allData={allData} 
                  onEdit={() => { setEditingPlayer(selectedPlayer); setIsPlayerModalOpen(true); }}
                  onDelete={() => setIsConfirmDeleteOpen(true)}
                />
              ) : (
                <Card className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a player to see their profile.</p>
                </Card>
              )}
            </div>
          </div>
          <TeamSessionViewer team={selectedTeam} allData={allData} onViewSession={setViewingSession} />
        </>
      )}
    </div>
  );
};