import React, { useState, useMemo, useEffect } from "react";
import {
  Team,
  Player,
  TrainingPlan,
  Session,
  Attendance,
  BehaviorEntry,
  SessionType,
  BehaviorStatus,
  BehaviorTag,
  Drill,
  SessionFocus,
  PlanDrill,
} from "../types";
import { Card, Button, Modal } from "./common";
import { BEHAVIOR_STATUS_CONFIG } from "../constants";
import { CheckCircleIcon, ChevronRightIcon, ArrowPathIcon } from "./Icons";

type SessionStage = "create" | "active" | "summary";
type PlanMethod = "custom" | "existing";

const BehaviorTracker: React.FC<{
  player: Player;
  attendance: Attendance;
  behavior: BehaviorEntry;
  onToggleAttendance: (playerId: string) => void;
  onUpdateBehavior: (playerId: string, status: BehaviorStatus) => void;
}> = ({
  player,
  attendance,
  behavior,
  onToggleAttendance,
  onUpdateBehavior,
}) => {
  const cycleBehavior = () => {
    const statuses = [
      BehaviorStatus.Green,
      BehaviorStatus.Yellow,
      BehaviorStatus.Red,
      BehaviorStatus.None,
    ];
    const currentIndex = statuses.indexOf(behavior.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onUpdateBehavior(player.id, statuses[nextIndex]);
  };

  const behaviorConfig = BEHAVIOR_STATUS_CONFIG[behavior.status];

  return (
    <div
      className={`p-3 rounded-lg flex items-center justify-between transition-all ${
        !attendance.present ? "opacity-40 bg-gray-100" : "bg-white"
      }`}
    >
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={attendance.present}
          onChange={() => onToggleAttendance(player.id)}
          className="h-5 w-5 rounded text-brand-blue focus:ring-brand-blue"
        />
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
  onSessionComplete: (
    session: Session,
    attendances: Attendance[],
    behaviors: BehaviorEntry[]
  ) => void;
  updateSession: (session: Session) => void;
  addPlan: (plan: Omit<TrainingPlan, "id">) => TrainingPlan;
}> = ({
  teams,
  players,
  drills,
  plans,
  onSessionComplete,
  updateSession,
  addPlan,
}) => {
  const [stage, setStage] = useState<SessionStage>("create");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [planMethod, setPlanMethod] = useState<PlanMethod>("custom");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [sessionDrills, setSessionDrills] = useState<PlanDrill[]>([]);

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorEntry[]>([]);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);

  const [summaryNotes, setSummaryNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const teamPlayers = useMemo(
    () => players.filter((p) => p.teamId === selectedTeamId),
    [players, selectedTeamId]
  );

  useEffect(() => {
    if (stage === "summary" && currentSession) {
      setSummaryNotes(currentSession.notes || "");
      setNotesSaved(false);
    }
  }, [stage, currentSession]);

  const handleAddDrillToSession = (drillId: string) => {
    const drill = drills.find((d) => d.id === drillId);
    if (drill && !sessionDrills.find((pd) => pd.drillId === drillId)) {
      setSessionDrills([
        ...sessionDrills,
        { drillId, duration: drill.duration },
      ]);
    }
  };

  const handleRemoveDrillFromSession = (drillId: string) => {
    setSessionDrills(sessionDrills.filter((pd) => pd.drillId !== drillId));
  };

  const handleSelectExistingPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlanId(planId);
      setSessionDrills(plan.drills);
      setPlanMethod("custom");
    }
  };

  const handleStartSession = () => {
    if (!selectedTeamId || sessionDrills.length === 0) return;

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    const tempPlan: Omit<TrainingPlan, "id"> = {
      name: `Session Plan - ${new Date().toLocaleDateString()}`,
      theme: selectedPlan?.theme || "Custom Session",
      drills: sessionDrills,
    };
    const newPlan = addPlan(tempPlan);

    const newSession: Session = {
      id: `s${Date.now()}`,
      teamId: selectedTeamId,
      trainingPlanId: newPlan.id,
      dateTime: new Date().toISOString(),
      type: SessionType.Training,
      focus: selectedPlan?.theme || "Custom Session",
    };

    setCurrentSession(newSession);
    setAttendances(
      teamPlayers.map((p) => ({
        sessionId: newSession.id,
        playerId: p.id,
        present: true,
      }))
    );
    setBehaviors(
      teamPlayers.map((p) => ({
        sessionId: newSession.id,
        playerId: p.id,
        status: BehaviorStatus.Green,
        tags: [],
      }))
    );
    setCurrentDrillIndex(0);
    setStage("active");
  };

  const handleFinishSession = () => {
    if (!currentSession) return;
    onSessionComplete(currentSession, attendances, behaviors);
    setStage("summary");
  };

  const resetSession = () => {
    setStage("create");
    setSelectedTeamId(null);
    setPlanMethod("custom");
    setSelectedPlanId(null);
    setSessionDrills([]);
    setCurrentSession(null);
    setAttendances([]);
    setBehaviors([]);
  };

  const handleSaveNotes = () => {
    if (!currentSession) return;
    const updatedSession = { ...currentSession, notes: summaryNotes };
    updateSession(updatedSession);
    setCurrentSession(updatedSession);
    setNotesSaved(true);
  };

  const handleToggleAttendance = (playerId: string) => {
    setAttendances(
      attendances.map((a) =>
        a.playerId === playerId ? { ...a, present: !a.present } : a
      )
    );
  };

  const handleUpdateBehavior = (playerId: string, status: BehaviorStatus) => {
    setBehaviors(
      behaviors.map((b) => (b.playerId === playerId ? { ...b, status } : b))
    );
  };

  const isStartDisabled = !selectedTeamId || sessionDrills.length === 0;

  if (stage === "create") {
    return (
      <Card className="max-w-3xl mx-auto my-8">
        <h2 className="text-2xl font-bold text-brand-blue mb-6">
          Create New Session
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1. Select Team
            </label>
            <select
              onChange={(e) => setSelectedTeamId(e.target.value)}
              defaultValue=""
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
            >
              <option value="" disabled>
                Select a team
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Choose Session Plan
            </label>
            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-100">
              <button
                onClick={() => {
                  setPlanMethod("custom");
                  setSelectedPlanId(null);
                  setSessionDrills([]);
                }}
                className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${
                  planMethod === "custom"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Build Custom Plan
              </button>
              <button
                onClick={() => setPlanMethod("existing")}
                className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${
                  planMethod === "existing"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Use Existing Plan
              </button>
            </div>
          </div>

          {planMethod === "custom" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Customize Drills
              </h3>
              <div className="space-y-2 p-2 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                <h4 className="font-semibold text-sm text-gray-800">
                  Selected Drills ({sessionDrills.length})
                </h4>
                {sessionDrills.map((pd) => {
                  const drill = drills.find((d) => d.id === pd.drillId);
                  return (
                    <div
                      key={pd.drillId}
                      className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                    >
                      <span>{drill?.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDrillFromSession(pd.drillId)}
                        className="text-red-500 text-xs font-semibold"
                      >
                        REMOVE
                      </button>
                    </div>
                  );
                })}
                {sessionDrills.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Add drills from the list below.
                  </p>
                )}
              </div>

              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-md">
                {drills.map((drill) => (
                  <div
                    key={drill.id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <div>
                      <p className="font-semibold">{drill.name}</p>
                      <p className="text-xs text-gray-500">
                        {drill.category} - {drill.duration} min
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleAddDrillToSession(drill.id)}
                      disabled={
                        !selectedTeamId ||
                        !!sessionDrills.find((pd) => pd.drillId === drill.id)
                      }
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {planMethod === "existing" && (
            <div className="space-y-2">
              <select
                onChange={(e) => handleSelectExistingPlan(e.target.value)}
                defaultValue=""
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              >
                <option value="" disabled>
                  Select a plan to load and customize
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-center text-gray-500 pt-2">
                Selecting a plan will load its drills into the custom builder
                for you to modify.
              </p>
            </div>
          )}

          <Button
            onClick={handleStartSession}
            disabled={isStartDisabled}
            className="w-full"
          >
            Start Session
          </Button>
        </div>
      </Card>
    );
  }

  const activeSessionPlan = plans.find(
    (p) => p.id === currentSession?.trainingPlanId
  );
  if (stage === "active" && activeSessionPlan) {
    const currentPlanDrill = activeSessionPlan.drills[currentDrillIndex];
    const currentDrill = drills.find((d) => d.id === currentPlanDrill.drillId);
    const hasPreviousDrill = currentDrillIndex > 0;
    const hasNextDrill =
      currentDrillIndex < activeSessionPlan.drills.length - 1;

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500 font-semibold bg-brand-blue text-white px-3 py-1 rounded-full">
              Drill {currentDrillIndex + 1} of {activeSessionPlan.drills.length}
            </p>
            <div className="text-sm text-gray-600">
              ⏱️ {currentPlanDrill.duration} minutes
            </div>
          </div>
          <h2 className="text-2xl font-bold text-brand-blue mb-2">
            {currentDrill?.name}
          </h2>
          <p className="text-gray-700 mb-4">{currentDrill?.description}</p>

          {currentDrill?.videoUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                📹 Watch Drill Video
              </p>
              <iframe
                src={currentDrill.videoUrl}
                title="Drill Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-48 rounded-md"
              ></iframe>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Equipment:</h4>
              <p className="text-gray-600">
                {currentDrill?.equipment.join(", ") || "None"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Category:</h4>
              <p className="text-gray-600">{currentDrill?.category}</p>
            </div>
          </div>
        </Card>

        <Card className="mb-6 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">
            Setup & Instructions:
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold">Setup:</h4>
              <p className="whitespace-pre-wrap mt-1">{currentDrill?.setup}</p>
            </div>
            <div>
              <h4 className="font-semibold">Instructions:</h4>
              <p className="whitespace-pre-wrap mt-1">
                {currentDrill?.instructions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            Track Player Behavior
          </h3>
          <div className="space-y-2">
            {teamPlayers.map((player) => (
              <BehaviorTracker
                key={player.id}
                player={player}
                attendance={attendances.find((a) => a.playerId === player.id)!}
                behavior={behaviors.find((b) => b.playerId === player.id)!}
                onToggleAttendance={handleToggleAttendance}
                onUpdateBehavior={handleUpdateBehavior}
              />
            ))}
          </div>
        </Card>

        {/* Drill Navigation */}
        {activeSessionPlan.drills.length === 1 ? (
          <div className="flex justify-center">
            <Button
              variant="danger"
              onClick={handleFinishSession}
              className="flex-1 max-w-md"
            >
              ✓ End Session & Save
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-4">
            <Button
              variant={hasPreviousDrill ? "secondary" : "disabled"}
              onClick={() => setCurrentDrillIndex((i) => Math.max(i - 1, 0))}
              disabled={!hasPreviousDrill}
              className="flex-1"
            >
              ← Previous Drill
            </Button>

            <Button
              variant="danger"
              onClick={handleFinishSession}
              className="flex-1"
            >
              ✓ End Session & Save
            </Button>

            <Button
              onClick={() =>
                setCurrentDrillIndex((i) =>
                  Math.min(i + 1, activeSessionPlan.drills.length - 1)
                )
              }
              disabled={!hasNextDrill}
              className="flex-1"
            >
              Next Drill →
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (stage === "summary") {
    const presentCount = attendances.filter((a) => a.present).length;
    const totalCount = attendances.length;
    return (
      <Card className="max-w-2xl mx-auto my-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-status-green mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-blue mb-2">
          Session Complete!
        </h2>
        <p className="text-gray-600">
          Attendance: {presentCount} / {totalCount} players
        </p>
        <div className="text-left space-y-2 my-4">
          <h3 className="font-semibold">Behavior Summary:</h3>
          {behaviors.map((b) => {
            const player = players.find((p) => p.id === b.playerId);
            const config = BEHAVIOR_STATUS_CONFIG[b.status];
            return (
              <div
                key={b.playerId}
                className="flex items-center justify-between"
              >
                <span>{player?.name}</span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${config.color} ${config.text}`}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-left space-y-2 my-6">
          <h3 className="font-semibold">Session Notes</h3>
          <textarea
            value={summaryNotes}
            onChange={(e) => {
              setSummaryNotes(e.target.value);
              setNotesSaved(false);
            }}
            rows={4}
            placeholder="Add notes about the session..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
          />
          <Button onClick={handleSaveNotes} disabled={notesSaved}>
            {notesSaved ? "Notes Saved!" : "Save Notes"}
          </Button>
        </div>
        <Button onClick={resetSession}>
          <ArrowPathIcon className="w-5 h-5 inline mr-2" /> New Session
        </Button>
      </Card>
    );
  }

  return null;
};
