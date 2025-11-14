
import React, { useState, useEffect } from 'react';
import { Drill, TrainingPlan, DrillCategory, PlanDrill } from '../types';
import { Card, Button, Modal } from './common';
import { PlusIcon, PlayIcon, EyeIcon, PencilIcon } from './Icons';

interface DrillAndPlanManagerProps {
  drills: Drill[];
  plans: TrainingPlan[];
  addDrill: (drill: Omit<Drill, 'id'>) => void;
  addPlan: (plan: Omit<TrainingPlan, 'id'>) => void;
  updatePlan: (plan: TrainingPlan) => void;
}

const DrillForm: React.FC<{ onSave: (drill: Omit<Drill, 'id'>) => void; onClose: () => void }> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DrillCategory>(DrillCategory.Technical);
  const [duration, setDuration] = useState(10);
  const [description, setDescription] = useState('');
  const [setup, setSetup] = useState('');
  const [instructions, setInstructions] = useState('');
  const [equipment, setEquipment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      category, 
      duration, 
      description, 
      setup, 
      instructions,
      videoUrl, 
      equipment: equipment.split(',').map(item => item.trim()), 
      ageGroups: [], 
      tags: [] 
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Drill Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as DrillCategory)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          {Object.values(DrillCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Short Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Equipment (comma-separated)</label>
        <input type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. Cones, Balls, Vests" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Setup Instructions</label>
        <textarea value={setup} onChange={(e) => setSetup(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Coach's Instructions</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
        <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="e.g. https://www.youtube.com/embed/..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Drill</Button>
      </div>
    </form>
  );
};


const PlanForm: React.FC<{ 
    drills: Drill[], 
    onSave: (plan: Omit<TrainingPlan, 'id'> | TrainingPlan) => void; 
    onClose: () => void,
    initialPlan?: TrainingPlan 
}> = ({ drills, onSave, onClose, initialPlan }) => {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedDrills, setSelectedDrills] = useState<PlanDrill[]>([]);
  
  useEffect(() => {
      if (initialPlan) {
          setName(initialPlan.name);
          setTheme(initialPlan.theme);
          setSelectedDrills(initialPlan.drills);
      }
  }, [initialPlan]);

  const handleAddDrill = (drillId: string) => {
      const drill = drills.find(d => d.id === drillId);
      if (drill && !selectedDrills.find(pd => pd.drillId === drillId)) {
          setSelectedDrills([...selectedDrills, { drillId, duration: drill.duration }]);
      }
  };

  const handleRemoveDrill = (drillId: string) => {
      setSelectedDrills(selectedDrills.filter(pd => pd.drillId !== drillId));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialPlan) {
        onSave({ id: initialPlan.id, name, theme, drills: selectedDrills });
    } else {
        onSave({ name, theme, drills: selectedDrills });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Plan Name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full rounded-md border-gray-300 shadow-sm"/>
      <input type="text" placeholder="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} required className="block w-full rounded-md border-gray-300 shadow-sm"/>
      
      <div className="space-y-2">
          <h4 className="font-semibold">Selected Drills</h4>
          {selectedDrills.map(pd => {
              const drill = drills.find(d => d.id === pd.drillId);
              return <div key={pd.drillId} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{drill?.name}</span>
                  <button type="button" onClick={() => handleRemoveDrill(pd.drillId)} className="text-red-500 font-semibold">Remove</button>
              </div>
          })}
           {selectedDrills.length === 0 && <p className="text-sm text-gray-500">No drills added yet.</p>}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto border-t pt-4">
          <h4 className="font-semibold">Available Drills</h4>
          {drills.map(drill => (
              <div key={drill.id} className="flex justify-between items-center p-2 border-b">
                  <span>{drill.name} ({drill.category})</span>
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleAddDrill(drill.id)} disabled={!!selectedDrills.find(pd => pd.drillId === drill.id)}>Add</Button>
              </div>
          ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Plan</Button>
      </div>
    </form>
  );
};


export const DrillAndPlanManager: React.FC<DrillAndPlanManagerProps> = ({ drills, plans, addDrill, addPlan, updatePlan }) => {
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
  const [viewingPlan, setViewingPlan] = useState<TrainingPlan | null>(null);
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

  const handleSavePlan = (planData: Omit<TrainingPlan, 'id'> | TrainingPlan) => {
    if ('id' in planData) {
      updatePlan(planData);
    } else {
      addPlan(planData);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Modal isOpen={isDrillModalOpen} onClose={() => setIsDrillModalOpen(false)} title="Create New Drill">
        <DrillForm onSave={addDrill} onClose={() => setIsDrillModalOpen(false)} />
      </Modal>
      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title="Create New Training Plan">
        <PlanForm drills={drills} onSave={handleSavePlan} onClose={() => setIsPlanModalOpen(false)} />
      </Modal>
       <Modal isOpen={!!editingPlan} onClose={() => setEditingPlan(null)} title="Edit Training Plan">
        <PlanForm drills={drills} onSave={handleSavePlan} onClose={() => setEditingPlan(null)} initialPlan={editingPlan!} />
      </Modal>
      <Modal isOpen={!!viewingVideoUrl} onClose={() => setViewingVideoUrl(null)} title="Drill Video">
        {viewingVideoUrl && (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={viewingVideoUrl}
              title="Drill Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full aspect-video"
            ></iframe>
          </div>
        )}
      </Modal>
       <Modal isOpen={!!viewingPlan} onClose={() => setViewingPlan(null)} title={`Plan Details: ${viewingPlan?.name}`}>
        {viewingPlan && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-brand-blue">{viewingPlan.name}</h3>
              <p className="text-sm text-gray-600 italic">Theme: {viewingPlan.theme}</p>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {viewingPlan.drills.map((planDrill, index) => {
                const drill = drills.find(d => d.id === planDrill.drillId);
                if (!drill) return <div key={index} className="text-red-500">Drill not found</div>;
                return (
                  <div key={drill.id} className="p-3 bg-gray-50 rounded-lg border">
                    <h4 className="font-bold text-md text-brand-blue">{index + 1}. {drill.name} ({planDrill.duration} min)</h4>
                    <p className="text-sm text-gray-700 mt-1 italic">{drill.description}</p>
                     <div className="mt-3 space-y-2 text-sm">
                        <div>
                            <h5 className="font-semibold text-gray-800">Equipment</h5>
                            <p className="text-gray-600">{drill.equipment.join(', ') || 'None'}</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Setup</h5>
                            <p className="text-gray-600 whitespace-pre-wrap">{drill.setup}</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Instructions</h5>
                            <p className="text-gray-600 whitespace-pre-wrap">{drill.instructions}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs bg-brand-green text-white px-2 py-1 rounded-full inline-block">{drill.category}</span>
                      {drill.videoUrl && (
                          <Button variant="secondary" onClick={() => setViewingVideoUrl(drill.videoUrl)}>
                              <PlayIcon className="w-5 h-5 mr-2 inline" /> Watch Video
                          </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drill Library */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-blue">Drill Library</h2>
            <Button onClick={() => setIsDrillModalOpen(true)}>
              <PlusIcon className="w-5 h-5 mr-2 inline" /> Add Drill
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {drills.map(drill => {
              const isExpanded = expandedDrillId === drill.id;
              return (
              <div key={drill.id} className="p-3 bg-gray-50 rounded-lg transition-all duration-300">
                <div className="cursor-pointer" onClick={() => setExpandedDrillId(isExpanded ? null : drill.id)}>
                    <h3 className="font-semibold">{drill.name} <span className="text-sm font-normal text-gray-500">- {drill.duration} min</span></h3>
                    <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                    <span className="text-xs bg-brand-green text-white px-2 py-1 rounded-full mt-2 inline-block">{drill.category}</span>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                     <div>
                        <h5 className="font-semibold text-gray-800 text-sm">Equipment</h5>
                        <p className="text-gray-600 text-sm">{drill.equipment.join(', ') || 'None'}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-800 text-sm">Setup</h5>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{drill.setup}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-800 text-sm">Instructions</h5>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{drill.instructions}</p>
                    </div>
                    {drill.videoUrl && (
                        <div className="pt-2">
                           <Button variant="secondary" size="sm" onClick={() => setViewingVideoUrl(drill.videoUrl)}>
                              <PlayIcon className="w-4 h-4 mr-1 inline" /> Watch Video
                           </Button>
                        </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>
        </Card>

        {/* Training Plans */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-blue">Training Plans</h2>
            <Button onClick={() => setIsPlanModalOpen(true)}>
              <PlusIcon className="w-5 h-5 mr-2 inline" /> Add Plan
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {plans.map(plan => (
              <div key={plan.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-gray-600 italic">Theme: {plan.theme}</p>
                        <p className="text-xs text-gray-500 mt-1">{plan.drills.length} drills</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setViewingPlan(plan)} className="text-brand-blue hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100">
                        <EyeIcon className="w-6 h-6"/>
                      </button>
                       <button onClick={() => setEditingPlan(plan)} className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-200">
                        <PencilIcon className="w-5 h-5"/>
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};