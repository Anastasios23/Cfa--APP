import React from "react";
import { Session, Team } from "../types";
import { CalendarIcon, ClockIcon } from "./Icons";

interface UpcomingSessionsProps {
  teams: Team[];
  sessions: Session[];
  currentCoach: string; // Coach name to filter sessions
}

/**
 * UpcomingSessions Component
 * Displays upcoming training sessions for a specific coach's team
 * Shows date, time, and session details
 */
export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  teams,
  sessions,
  currentCoach,
}) => {
  // Get the coach's team(s)
  const coachTeams = teams.filter((team) => team.coach === currentCoach);

  if (coachTeams.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No teams found for coach: {currentCoach}
      </div>
    );
  }

  // Get upcoming sessions for the coach's teams
  const coachTeamIds = coachTeams.map((t) => t.id);
  const now = new Date();

  const upcomingSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.dateTime);
      return coachTeamIds.includes(session.teamId) && sessionDate > now;
    })
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

  const pastSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.dateTime);
      return coachTeamIds.includes(session.teamId) && sessionDate <= now;
    })
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    )
    .slice(0, 3); // Show last 3 past sessions

  const formatSessionDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleTimeString("en-US", options);
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Upcoming Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-blue mb-4">
            📅 Upcoming Sessions
          </h2>

          {upcomingSessions.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-brand-blue font-medium">
                No upcoming sessions scheduled
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Schedule your next training session
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const team = teams.find((t) => t.id === session.teamId);
                return (
                  <div
                    key={session.id}
                    className="bg-white border-2 border-brand-blue rounded-lg p-4 sm:p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Left Section: Date & Time */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-5 h-5 text-brand-blue" />
                          <span className="font-semibold text-lg text-brand-blue">
                            {formatDate(session.dateTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <ClockIcon className="w-4 h-4 text-brand-green" />
                          <span className="text-brand-green font-bold text-lg">
                            {formatTime(session.dateTime)}
                          </span>
                        </div>
                      </div>

                      {/* Right Section: Team & Session Info */}
                      <div className="flex-1 sm:text-right">
                        <div className="mb-2">
                          <p className="text-sm text-gray-500 uppercase tracking-wide">
                            Team
                          </p>
                          <p className="font-bold text-gray-800 text-lg">
                            {team?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">
                            Session Type
                          </p>
                          <p className="font-semibold text-brand-blue">
                            {session.type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            Focus
                          </p>
                          <p className="font-medium text-gray-700">
                            {session.focus}
                          </p>
                        </div>
                        {session.notes && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Notes
                            </p>
                            <p className="font-medium text-gray-700 line-clamp-2">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-blue mb-4">
              📋 Recent Sessions
            </h2>
            <div className="space-y-3">
              {pastSessions.map((session) => {
                const team = teams.find((t) => t.id === session.teamId);
                return (
                  <div
                    key={session.id}
                    className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-5 opacity-75"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-700">
                            {formatDate(session.dateTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">
                            {formatTime(session.dateTime)}
                          </span>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">
                          Team
                        </p>
                        <p className="font-bold text-gray-800">{team?.name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
