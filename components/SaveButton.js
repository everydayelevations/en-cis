import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SaveButton({ entry, style = {} }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await supabase.from('saved_content').insert([{
        type: entry.type || 'content',
        title: (entry.title || entry.topic || 'Untitled').slice(0, 200),
        platform: entry.platform || null,
        angle: entry.angle || null,
        content_preview: (entry.preview || '').slice(0, 500),
        full_content: entry.full || entry.preview || '',
        perf_rating: entry.perf || null,
        client_name: entry.client || null,
        notes: entry.notes || null,
      }]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save error:', e);
    }
    setSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      style={{
        background: saved ? 'rgba(39,174,96,0.15)' : 'rgba(0,194,255,0.08)',
        color: saved ? '#27ae60' : '#00C2FF',
        border: `1px solid ${saved ? 'rgba(39,174,96,0.3)' : 'rgba(0,194,255,0.2)'}`,
        borderRadius: 7,
        padding: '6px 14px',
        fontSize: 12,
        fontWeight: 700,
        cursor: saving || saved ? 'default' : 'pointer',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
    </button>
  );
}
