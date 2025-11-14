
import React, { useState } from 'react';
import { Team, Player, AppState, BehaviorStatus } from '../types';
import { Card, Button, Modal } from './common';
import { BEHAVIOR_STATUS_CONFIG } from '../constants';
import { PlusIcon } from './Icons';

const PlayerProfile: React.FC<{ player: Player; allData: AppState }> = ({ player, allData }) => {
  const playerSessions = allData.sessions.filter(s => {
      const attendance = allData.attendances.find(a => a.sessionId === s.id && a.playerId === player.id);
      return attendance?.present;
  }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <Card>
      <h3 className="text-xl font-bold text-brand-blue">{player.name}</h3>
      <p className="text-sm text-gray-500">DOB: {player.dob}</p>
      {player.notes && <p className="mt-2 text-gray-700 italic">Notes: {player.notes}</p>}
      
      <div className="mt-4">
        <h4 className="font-semibold">Recent Behavior History</h4>
        <div className="space-y-2 mt-2">
          {playerSessions.length > 0 ? playerSessions.map(session => {
            const behavior = allData.behaviorEntries.find(b => b.sessionId === session.id && b.playerId === player.id);
            if (!behavior) return null;
            const config = BEHAVIOR_STATUS_CONFIG[behavior.status];
            return (
              <div key={session.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                <span className="text-sm">{new Date(session.dateTime).toLocaleDateString()} - {session.focus}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color} ${config.text}`}>{config.label}</span>
              </div>
            )
          }) : <p className="text-sm text-gray-500">No session history yet.</p>}
        </div>
      </div>
    </Card>
  );
};

const TeamForm: React.FC<{ onSave: (team: Omit<Team, 'id'>) => void; onClose: () => void }> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [coach, setCoach] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ageGroup || !coach) return;
    onSave({ name, ageGroup, coach });
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


interface TeamAndPlayerViewsProps {
    allData: AppState;
    addTeam: (team: Omit<Team, 'id'>) => void;
}

export const TeamAndPlayerViews: React.FC<TeamAndPlayerViewsProps> = ({ allData, addTeam }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(allData.teams[0] || null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const teamPlayers = allData.players.filter(p => p.teamId === selectedTeam?.id);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeam(allData.teams.find(t => t.id === teamId) || null);
    setSelectedPlayer(null); // Reset player selection when team changes
  };

  return (
    <div className="p-4 space-y-6">
       <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Create New Team">
        <TeamForm onSave={addTeam} onClose={() => setIsTeamModalOpen(false)} />
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
         <Button onClick={() => setIsTeamModalOpen(true)} variant="secondary">
              <PlusIcon className="w-5 h-5 inline" />
        </Button>
      </div>

      {selectedTeam && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <h2 className="text-2xl font-bold text-brand-blue">{selectedTeam.name} Roster</h2>
              <p className="text-gray-600 mb-4">{selectedTeam.ageGroup} - Coached by {selectedTeam.coach}</p>
              <ul className="space-y-2">
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
              </ul>
            </Card>
          </div>
          <div className="md:col-span-2">
            {selectedPlayer ? (
              <PlayerProfile player={selectedPlayer} allData={allData} />
            ) : (
              <Card className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a player to see their profile.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};