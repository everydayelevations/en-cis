import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ContentLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const deleteItem = async (id) => {
    await supabase.from('saved_content').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const types = ['all', ...new Set(items.map(i => i.type).filter(Boolean))];

  const filtered = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (search && !JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeColors = {
    script: '#1B4F72', caption: '#145A32', batch: '#7E5109',
    calendar: '#6E2F8E', profile: '#0A66C2', magnet: '#C0392B',
    community: '#1A5276', default: '#2C3E50',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 28, background: '#00C2FF', borderRadius: 2 }} />
          <div>
            <h2 style={{ color: '#111827', margin: 0, fontSize: 18, fontWeight: 800 }}>Content Library</h2>
            <p style={{ color: '#6B7280', margin: '4px 0 0', fontSize: 13 }}>
              {items.length > 0 ? `${items.length} pieces saved to Supabase` : 'Saved content appears here'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchItems}
          style={{ background: '#F9FAFB', color: '#111827', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {/* Search + Filter */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved content..."
            style={{ flex: 1, minWidth: 200, background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', color: '#111827', fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ background: filter === t ? '#EEF2FF' : '#F9FAFB', color: '#111827', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: filter === t ? 700 : 400, textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280', fontSize: 13 }}>
          Loading from Supabase...
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>
            Generate content in any tool and hit Save — it shows up here.
          </div>
        </div>
      )}

      {/* Content list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderLeft: `3px solid ${typeColors[item.type] || typeColors.default}`,
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: typeColors[item.type] || typeColors.default, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.type || 'content'}
                    </span>
                    <span style={{ color: '#6B7280', fontSize: 11 }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {item.platform && (
                      <span style={{ background: '#F9FAFB', color: '#6B7280', borderRadius: 4, padding: '2px 7px', fontSize: 10 }}>{item.platform}</span>
                    )}
                    {item.client_name && (
                      <span style={{ background: '#F9FAFB', color: '#6B7280', borderRadius: 4, padding: '2px 7px', fontSize: 10 }}>👤 {item.client_name}</span>
                    )}
                  </div>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {item.title || 'Untitled'}
                  </div>
                  {item.content_preview && (
                    <div style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.6 }}>
                      {item.content_preview.slice(0, 200)}{item.content_preview.length > 200 ? '...' : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.full_content || item.content_preview || '')}
                    style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{ background: 'transparent', color: '#D1D5DB', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 14, cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && items.length > 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280', fontSize: 13 }}>
              No results match your filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
