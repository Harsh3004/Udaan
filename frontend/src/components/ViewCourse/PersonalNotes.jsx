import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit3, FiSave, FiTrash2, FiPlus, FiClock,
  FiLoader, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';

const formatTimestamp = (seconds) => {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const PersonalNotes = ({ courseId, currentVideo, token, currentTime }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!currentVideo?._id) return;
    setIsFetching(true);
    try {
      const res = await request(
        `${endpoints.AI_GET_NOTES_API}/${currentVideo._id}`,
        'GET', null, token
      );
      const data = await res.json();
      if (data.success) setNotes(data.notes || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setIsFetching(false);
    }
  }, [currentVideo?._id, token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async () => {
    if (!newNote.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const res = await request(endpoints.AI_SAVE_NOTE_API, 'POST', {
        courseId,
        subsectionId: currentVideo._id,
        content: newNote.trim(),
        videoTimestamp: includeTimestamp ? Math.floor(currentTime) : null
      }, token);
      const data = await res.json();
      if (data.success) {
        toast.success('Note saved!');
        setNewNote('');
        setIncludeTimestamp(false);
        setNotes(prev => [data.note, ...prev]);
      } else {
        toast.error(data.message || 'Failed to save note');
      }
    } catch (err) {
      toast.error('Error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    setDeletingId(noteId);
    try {
      const res = await request(
        `${endpoints.AI_DELETE_NOTE_API}/${noteId}`,
        'DELETE', null, token
      );
      const data = await res.json();
      if (data.success) {
        setNotes(prev => prev.filter(n => n._id !== noteId));
        toast.success('Note deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (err) {
      toast.error('Error deleting note');
    } finally {
      setDeletingId(null);
    }
  };

  const isAINote = (content) => content.startsWith('[AI Answer]');

  return (
    <div className="space-y-6">
      {/* New Note Input */}
      <div className="space-y-3">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Write a note about this lesson…"
          rows={4}
          className="w-full bg-[#000B1C] border border-rich-black-700 rounded-2xl p-5 text-sm text-rich-black-50 focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 outline-none transition-all placeholder:text-rich-black-400 resize-none"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Timestamp toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setIncludeTimestamp(!includeTimestamp)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${includeTimestamp ? 'bg-yellow-50' : 'bg-rich-black-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeTimestamp ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-xs text-rich-black-300 flex items-center gap-1.5">
              <FiClock size={12} />
              Capture timestamp
              {includeTimestamp && currentTime > 0 && (
                <span className="text-yellow-50 font-mono">({formatTimestamp(currentTime)})</span>
              )}
            </span>
          </label>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!newNote.trim() || isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-yellow-50 text-rich-black-900 font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? <FiLoader size={15} className="animate-spin" /> : <FiSave size={15} />}
            Save Note
          </motion.button>
        </div>
      </div>

      {/* Notes List */}
      {isFetching ? (
        <div className="flex items-center justify-center py-10 text-rich-black-400">
          <FiLoader className="animate-spin" size={24} />
        </div>
      ) : notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 space-y-3"
        >
          <FiEdit3 size={36} className="mx-auto text-rich-black-700" />
          <p className="text-sm text-rich-black-500">No notes for this lesson yet.</p>
          <p className="text-xs text-rich-black-600">Pro tip: You can also save AI answers as notes!</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rich-black-400 uppercase tracking-widest">
              {notes.length} Note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`relative p-5 rounded-2xl border group transition-all ${
                  isAINote(note.content)
                    ? 'bg-yellow-50/5 border-yellow-50/15'
                    : 'bg-rich-black-800/40 border-rich-black-700 hover:border-rich-black-600'
                }`}
              >
                {/* AI badge */}
                {isAINote(note.content) && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-yellow-50 bg-yellow-50/10 px-2 py-0.5 rounded-full border border-yellow-50/20">
                    AI Answer
                  </span>
                )}

                {/* Timestamp badge */}
                {note.videoTimestamp != null && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiClock size={11} className="text-rich-black-400" />
                    <span className="text-[11px] text-rich-black-400 font-mono font-semibold">
                      {formatTimestamp(note.videoTimestamp)}
                    </span>
                  </div>
                )}

                <p className="text-sm text-rich-black-100 leading-relaxed whitespace-pre-wrap pr-6">
                  {isAINote(note.content) ? note.content.replace('[AI Answer]\n', '') : note.content}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-rich-black-500">{timeAgo(note.createdAt)}</span>
                  <button
                    onClick={() => handleDelete(note._id)}
                    disabled={deletingId === note._id}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[11px] text-red-500/70 hover:text-red-400 transition-all disabled:opacity-40"
                  >
                    {deletingId === note._id ? <FiLoader size={12} className="animate-spin" /> : <FiTrash2 size={12} />}
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PersonalNotes;
