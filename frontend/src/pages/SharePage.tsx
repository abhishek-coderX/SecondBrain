
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Cards } from '../components/Cards';
import { Logo } from '../components/icons/Logo';
import type { Content } from '../types/type';

const SharePage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/share/${shareId}`);
        setContents(res.data.content);
        setUsername(res.data.username);
      } catch {
        setError('This scroll could not be found. The link may be invalid or expired.');
      } finally {
        setIsLoading(false);
      }
    };
    if (shareId) fetchSharedContent();
  }, [shareId]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0d1f3c', borderBottom: '2px solid #1e3a5f' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="md" />
            <span style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', fontWeight: 700, fontSize: '1rem' }}>
              SecondBrain
            </span>
          </div>
          {username && !isLoading && (
            <p style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif", fontSize: '0.9rem' }}>
              Voyage by <span style={{ color: '#d4a017', fontWeight: 600 }}>{username}</span>
            </p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <>
            <div className="mb-6">
              <div className="op-skeleton h-8 w-48 rounded-lg mb-2" />
              <div className="op-skeleton h-4 w-24 rounded" />
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-5 rounded-xl op-skeleton"
                  style={{ height: [220, 160, 280, 200, 240, 170, 300, 190][i] + "px", border: '2px solid #1e3a5f' }} />
              ))}
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-5xl mb-4">🗺️</p>
            <p style={{ fontFamily: "'Cinzel', serif", color: '#ef4444', fontSize: '1rem', fontWeight: 700 }}>
              Lost at Sea
            </p>
            <p style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif", marginTop: '6px', fontSize: '0.95rem' }}>
              {error}
            </p>
          </div>
        ) : contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-5xl mb-4">⚓</p>
            <p style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', fontSize: '1rem', fontWeight: 700 }}>
              This chest is empty.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', fontWeight: 700, fontSize: '1.5rem' }}>
                {username ? `${username}'s Treasure` : "Shared Treasure"}
              </h1>
              <p style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif", marginTop: '4px', fontSize: '0.9rem' }}>
                {contents.length} piece{contents.length !== 1 ? 's' : ''} of loot
              </p>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
              {contents.map((content) => (
                <div key={content._id} className="break-inside-avoid mb-5">
                  <Cards {...content} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SharePage;
