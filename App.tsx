import React, { useState } from 'react';
import { AppState, View, Session, Attendance, BehaviorEntry, Drill, TrainingPlan, Team, Player } from './types';
import { MOCK_DATA } from './constants';
import { ClipboardIcon, HomeIcon, ListBulletIcon, UsersIcon } from './components/Icons';
import { SessionManager } from './components/SessionManager';
import { DrillAndPlanManager } from './components/DrillAndPlanManager';
import { TeamAndPlayerViews } from './components/TeamAndPlayerViews';

const App: React.FC = () => {
  const [data, setData] = useState<AppState>(MOCK_DATA);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleSessionComplete = (session: Session, attendances: Attendance[], behaviors: BehaviorEntry[]) => {
    setData(prevData => ({
      ...prevData,
      sessions: [...prevData.sessions, session],
      attendances: [...prevData.attendances, ...attendances],
      behaviorEntries: [...prevData.behaviorEntries, ...behaviors],
    }));
  };

  const updateSession = (updatedSession: Session) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === updatedSession.id ? updatedSession : s),
    }));
  };
  
  const addDrill = (drill: Omit<Drill, 'id'>) => {
    const newDrill = { ...drill, id: `d${Date.now()}`};
    setData(prev => ({...prev, drills: [...prev.drills, newDrill]}));
  };

  const addPlan = (plan: Omit<TrainingPlan, 'id'>): TrainingPlan => {
    const newPlan = { ...plan, id: `tp${Date.now()}`};
    setData(prev => ({...prev, trainingPlans: [...prev.trainingPlans, newPlan]}));
    return newPlan;
  };

  const updatePlan = (updatedPlan: TrainingPlan) => {
    setData(prev => ({
      ...prev,
      trainingPlans: prev.trainingPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p),
    }));
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam = { ...team, id: `t${Date.now()}`};
    setData(prev => ({...prev, teams: [...prev.teams, newTeam]}));
  };

  const updateTeam = (updatedTeam: Team) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === updatedTeam.id ? updatedTeam : t)
    }));
  };

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = { ...player, id: `p${Date.now()}`};
    setData(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
  };
  
  const updatePlayer = (updatedPlayer: Player) => {
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    }));
  };
  
  const removePlayer = (playerId: string) => {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };


  const renderView = () => {
    switch (currentView) {
      case 'session':
        return <SessionManager 
                 teams={data.teams} 
                 players={data.players} 
                 drills={data.drills}
                 plans={data.trainingPlans}
                 onSessionComplete={handleSessionComplete} 
                 updateSession={updateSession}
                 addPlan={addPlan}
                 />;
      case 'drills':
          return <DrillAndPlanManager 
                    drills={data.drills} 
                    plans={data.trainingPlans} 
                    addDrill={addDrill} 
                    addPlan={addPlan} 
                    updatePlan={updatePlan}
                 />;
      case 'teams':
        return <TeamAndPlayerViews 
                  allData={data} 
                  addTeam={addTeam} 
                  updateTeam={updateTeam} 
                  addPlayer={addPlayer} 
                  updatePlayer={updatePlayer}
                  removePlayer={removePlayer}
               />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="pb-20">
        {renderView()}
      </main>
      <NavBar currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

const Header: React.FC = () => (
  <header className="bg-brand-blue shadow-md sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center space-x-3">
        <ClipboardIcon className="h-8 w-8 text-brand-accent" />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Coach's Clipboard
        </h1>
      </div>
    </div>
  </header>
);

const NavBar: React.FC<{ currentView: View; setView: (view: View) => void }> = ({ currentView, setView }) => {
  // FIX: Added 'as const' to ensure TypeScript infers the literal types for 'view'
  // instead of the wider 'string' type, which was causing a type error with setView.
  const navItems = [
    { view: 'dashboard', label: 'Home', icon: HomeIcon },
    { view: 'session', label: 'Session', icon: ClipboardIcon },
    { view: 'drills', label: 'Drills/Plans', icon: ListBulletIcon },
    { view: 'teams', label: 'Teams', icon: UsersIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md flex justify-around">
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => setView(item.view)}
          className={`flex flex-col items-center justify-center w-full py-2 px-1 text-sm font-medium transition-colors ${
            currentView === item.view ? 'text-brand-blue' : 'text-gray-500 hover:text-brand-blue'
          }`}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Dashboard: React.FC<{onNavigate: (view: View) => void}> = ({ onNavigate }) => (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-blue mb-6">Welcome, Coach!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                    title="Start New Session"
                    description="Begin a new training or match session to track attendance and behavior."
                    icon={<ClipboardIcon className="w-8 h-8"/>}
                    onClick={() => onNavigate('session')}
                />
                <DashboardCard 
                    title="Manage Drills & Plans"
                    description="Create, view, and organize your drill library and training plans."
                    icon={<ListBulletIcon className="w-8 h-8"/>}
                    onClick={() => onNavigate('drills')}
                />
                <DashboardCard 
                    title="View Teams & Players"
                    description="Access team rosters and check individual player profiles and history."
                    icon={<UsersIcon className="w-8 h-8"/>}
                    onClick={() => onNavigate('teams')}
                />
            </div>
        </div>
    </div>
);

const DashboardCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick}) => (
    <button onClick={onClick} className="text-left bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out w-full">
        <div className="flex items-start space-x-4">
            <div className="text-brand-green">{icon}</div>
            <div>
                <h3 className="text-xl font-bold text-brand-blue">{title}</h3>
                <p className="mt-1 text-gray-600">{description}</p>
            </div>
        </div>
    </button>
);

export default App;
