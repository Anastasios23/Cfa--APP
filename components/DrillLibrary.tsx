import React, { useState, useMemo } from "react";
import { Drill, DrillCategory, SessionFocus } from "../types";
import { Card, Button } from "./common";
import { PlayIcon, EyeIcon } from "./Icons";

interface DrillLibraryProps {
  drills: Drill[];
  onSelectDrill?: (drill: Drill) => void;
  onViewDrill: (drill: Drill) => void;
  onPlayVideo: (videoUrl: string) => void;
}

interface FilterOptions {
  searchQuery: string;
  ageGroups: string[];
  categories: DrillCategory[];
  sessionFocus: SessionFocus[];
}

/**
 * DrillLibrary Component
 * Displays drills with search and filtering capabilities
 * Helps coaches quickly find and reuse quality drills
 */
export const DrillLibrary: React.FC<DrillLibraryProps> = ({
  drills,
  onSelectDrill,
  onViewDrill,
  onPlayVideo,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    ageGroups: [],
    categories: [],
    sessionFocus: [],
  });

  const [expandedFilters, setExpandedFilters] = useState(false);

  // Get unique values for filter dropdowns
  const uniqueAgeGroups = useMemo(
    () => Array.from(new Set(drills.flatMap((d) => d.ageGroups))).sort(),
    [drills]
  );

  // Filter drills based on all criteria
  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      // Search by name
      const matchesSearch = drill.name
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());

      // Filter by age group
      const matchesAgeGroup =
        filters.ageGroups.length === 0 ||
        filters.ageGroups.some((ag) => drill.ageGroups.includes(ag));

      // Filter by category
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(drill.category);

      // Filter by tags/focus
      const matchesFocus =
        filters.sessionFocus.length === 0 ||
        filters.sessionFocus.some((focus) =>
          drill.tags.some((tag) =>
            tag.toLowerCase().includes(focus.toLowerCase())
          )
        );

      return (
        matchesSearch && matchesAgeGroup && matchesCategory && matchesFocus
      );
    });
  }, [drills, filters]);

  const toggleAgeGroup = (ageGroup: string) => {
    setFilters((prev) => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ageGroup)
        ? prev.ageGroups.filter((ag) => ag !== ageGroup)
        : [...prev.ageGroups, ageGroup],
    }));
  };

  const toggleCategory = (category: DrillCategory) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleSessionFocus = (focus: SessionFocus) => {
    setFilters((prev) => ({
      ...prev,
      sessionFocus: prev.sessionFocus.includes(focus)
        ? prev.sessionFocus.filter((f) => f !== focus)
        : [...prev.sessionFocus, focus],
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      ageGroups: [],
      categories: [],
      sessionFocus: [],
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.ageGroups.length > 0 ||
    filters.categories.length > 0 ||
    filters.sessionFocus.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-brand-blue mb-2">
            🎯 Drill Library
          </h2>
          <p className="text-gray-600">
            Search and filter quality drills to build your sessions
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search drills by name..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </Card>

        {/* Filters Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="text-brand-blue font-semibold hover:underline flex items-center gap-2"
          >
            {expandedFilters ? "▼" : "▶"} Advanced Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-brand-blue text-white text-xs rounded-full">
                {filters.ageGroups.length +
                  filters.categories.length +
                  filters.sessionFocus.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {expandedFilters && (
          <Card className="mb-4 bg-gray-50">
            <div className="space-y-4">
              {/* Age Group Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Age Group</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueAgeGroups.map((ageGroup) => (
                    <button
                      key={ageGroup}
                      onClick={() => toggleAgeGroup(ageGroup)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.ageGroups.includes(ageGroup)
                          ? "bg-brand-blue text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {ageGroup}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(DrillCategory).map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.categories.includes(category)
                          ? "bg-brand-green text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Focus Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Session Focus / Value
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SessionFocus).map((focus) => (
                    <button
                      key={focus}
                      onClick={() => toggleSessionFocus(focus)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.sessionFocus.includes(focus)
                          ? "bg-brand-accent text-gray-800"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex justify-end pt-2">
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing <span className="font-semibold">{filteredDrills.length}</span>{" "}
          drill
          {filteredDrills.length !== 1 ? "s" : ""}
          {drills.length !== filteredDrills.length && (
            <span> out of {drills.length} total</span>
          )}
        </div>

        {/* Drill Grid */}
        {filteredDrills.length === 0 ? (
          <Card className="text-center py-12 bg-blue-50 border-2 border-blue-200">
            <p className="text-lg font-semibold text-brand-blue mb-2">
              No drills found
            </p>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrills.map((drill) => (
              <Card
                key={drill.id}
                className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-brand-blue flex-1">
                      {drill.name}
                    </h3>
                    <span className="text-sm font-medium text-white bg-brand-green px-2 py-1 rounded whitespace-nowrap ml-2">
                      {drill.duration}m
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {drill.ageGroups.join(", ")}
                  </p>

                  <p className="text-sm text-gray-700 mb-3">
                    {drill.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="inline-block px-2 py-1 text-xs bg-brand-green text-white rounded">
                      {drill.category}
                    </span>
                    {drill.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {drill.tags.length > 2 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        +{drill.tags.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    📦 Equipment: {drill.equipment.join(", ") || "None"}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewDrill(drill)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" /> Details
                  </Button>
                  {drill.videoUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onPlayVideo(drill.videoUrl!)}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <PlayIcon className="w-4 h-4" /> Video
                    </Button>
                  )}
                  {onSelectDrill && (
                    <Button
                      size="sm"
                      onClick={() => onSelectDrill(drill)}
                      className="flex-1"
                    >
                      Select
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
