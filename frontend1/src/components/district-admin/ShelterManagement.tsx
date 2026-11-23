import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, Users, Shield, Loader2, Save, X } from 'lucide-react';
import { Shelter } from '../../types';
import {
  fetchShelters,
  createShelter,
  updateShelter,
  deleteShelter
} from '../../services/districtAdminService';

export const ShelterManagement: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentShelter, setCurrentShelter] = useState<Partial<Shelter>>({});
  
  const loadShelters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShelters();
      setShelters(data);
    } catch (err: any) {
      setError('Failed to load shelters. ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleAddNew = () => {
    setCurrentShelter({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      capacity: 0,
      contact_phone: '',
      is_active: true
    });
    setIsEditing(true);
  };

  const handleEdit = (s: Shelter) => {
    setCurrentShelter({ ...s });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this shelter?")) return;
    try {
      await deleteShelter(id);
      loadShelters();
    } catch (err: any) {
      alert("Failed to delete shelter: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentShelter.id) {
        await updateShelter(currentShelter.id, currentShelter);
      } else {
        await createShelter(currentShelter);
      }
      setIsEditing(false);
      loadShelters();
    } catch (err: any) {
      alert("Failed to save shelter: " + (err.response?.data?.detail || err.message));
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif uppercase tracking-tight text-[#141712]">
            {currentShelter.id ? 'Edit Shelter' : 'Add New Shelter'}
          </h2>
          <button 
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Shelter Name</label>
              <input 
                type="text" 
                required 
                value={currentShelter.name || ''}
                onChange={e => setCurrentShelter({...currentShelter, name: e.target.value})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
                placeholder="e.g. Govt Primary School Relief Camp"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={currentShelter.contact_phone || ''}
                onChange={e => setCurrentShelter({...currentShelter, contact_phone: e.target.value})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
                placeholder="+91..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Address</label>
              <input 
                type="text" 
                value={currentShelter.address || ''}
                onChange={e => setCurrentShelter({...currentShelter, address: e.target.value})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
                placeholder="Full address"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Latitude</label>
              <input 
                type="number" 
                step="any"
                required 
                value={currentShelter.latitude || ''}
                onChange={e => setCurrentShelter({...currentShelter, latitude: parseFloat(e.target.value)})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Longitude</label>
              <input 
                type="number" 
                step="any"
                required 
                value={currentShelter.longitude || ''}
                onChange={e => setCurrentShelter({...currentShelter, longitude: parseFloat(e.target.value)})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#474C3F] font-bold mb-1">Capacity (Persons)</label>
              <input 
                type="number" 
                value={currentShelter.capacity || ''}
                onChange={e => setCurrentShelter({...currentShelter, capacity: parseInt(e.target.value)})}
                className="w-full p-2.5 rounded-xl border-2 border-[#DFD8CA] bg-[#F9F8F6] focus:border-[#1E4B33] focus:ring-0 text-sm font-sans" 
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentShelter.is_active !== false}
                  onChange={e => setCurrentShelter({...currentShelter, is_active: e.target.checked})}
                  className="w-5 h-5 text-[#1E4B33] rounded focus:ring-0"
                />
                <span className="text-sm font-bold text-[#141712]">Active Status</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#DFD8CA]">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase transition-colors cursor-pointer border-2 border-[#BCB29E] bg-white hover:bg-[#F0ECE1] text-[#141712]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase transition-colors cursor-pointer border-2 border-[#143524] bg-[#1E4B33] hover:bg-[#143524] text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Shelter
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-serif uppercase tracking-tight text-[#141712]">
            Evacuation Shelters Management
          </h2>
          <p className="text-xs text-[#474C3F] font-sans">
            Manage safe houses, schools, and relief camps for citizen evacuation routing.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shelter</span>
        </button>
      </div>
      
      {error && (
        <div className="p-4 rounded-xl bg-[#FDF0E8] border border-[#F2BCA0] text-[#BD5015] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E4B33]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.filter(s => s.is_active).length === 0 && (
            <div className="col-span-full p-8 text-center border-2 border-dashed border-[#BCB29E] rounded-3xl">
              <Shield className="w-12 h-12 text-[#BCB29E] mx-auto mb-3" />
              <p className="text-[#474C3F] font-bold">No active shelters found.</p>
              <p className="text-sm text-[#848A7A]">Add a shelter to allow citizens to route to safety.</p>
            </div>
          )}
          
          {shelters.filter(s => s.is_active).map(shelter => (
            <div key={shelter.id} className="p-5 rounded-2xl bg-white border-2 border-[#BCB29E] shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#141712] text-lg leading-tight">{shelter.name}</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(shelter)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(shelter.id)} className="p-1.5 rounded-lg bg-[#FDF0E8] hover:bg-[#FBE4D8] text-[#BD5015] transition-colors cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-[#474C3F]">
                  {shelter.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#1E4B33]" />
                      <span>{shelter.address}</span>
                    </div>
                  )}
                  {shelter.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0 text-[#1E4B33]" />
                      <span>{shelter.contact_phone}</span>
                    </div>
                  )}
                  {shelter.capacity ? (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0 text-[#1E4B33]" />
                      <span>{shelter.capacity} capacity</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="text-xs text-gray-500 font-mono">
                      {shelter.latitude.toFixed(4)}, {shelter.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
