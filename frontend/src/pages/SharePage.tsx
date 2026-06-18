import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Cards } from '../components/Cards';
import { Logo } from '../components/icons/Logo';
import type { Content } from '../types/type';
import Masonry from 'react-masonry-css';

const SharePage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const res = await api.get(`/share/${shareId}`);
        setContents(res.data.content);
        setUsername(res.data.username);
      } catch {
        setError('This share link could not be found. It may be invalid or expired.');
      } finally {
        setIsLoading(false);
      }
    };
    if (shareId) fetchSharedContent();
  }, [shareId]);

  return (
    <div className="min-h-screen bento-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[rgba(125,105,86,0.14)] backdrop-blur-[12px] flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <p className="text-2xl font-semibold text-slate-900">
              SecondBrain
            </p>
          </div>
          {username && !isLoading && (
            <p className="text-sm text-slate-500 font-medium">
              Shared by <span className="font-semibold text-slate-800">{username}</span>
            </p>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col">
        {isLoading ? (
          <>
            <div className="mb-6">
              <div className="bento-skeleton h-10 w-64 mb-3" />
              <div className="bento-skeleton h-5 w-32" />
            </div>
            <Masonry
              breakpointCols={{
                default: 4,
                1280: 4,
                1024: 3,
                768: 2,
                640: 1
              }}
              className="flex w-full -ml-3"
              columnClassName="pl-3 bg-clip-padding flex flex-col"
            >
              {[220, 160, 280, 200, 240, 170, 300, 190].map((height, i) => (
                <div key={i} className="bento-skeleton mb-3" style={{ height }} />
              ))}
            </Masonry>
          </>
        ) : error ? (
          <div className="bento-card flex flex-col items-center justify-center py-20 px-8 text-center my-auto">
            <p className="text-5xl mb-4">🧭</p>
            <h2 className="bento-heading text-3xl font-semibold text-red-500 mb-2">
              Link Expired or Invalid
            </h2>
            <p className="text-slate-600 max-w-md text-sm">
              {error}
            </p>
          </div>
        ) : contents.length === 0 ? (
          <div className="bento-card flex flex-col items-center justify-center py-20 px-8 text-center my-auto">
            <p className="text-5xl mb-4">📭</p>
            <h2 className="bento-heading text-3xl font-semibold text-slate-700 mb-2">
              No Shared Content
            </h2>
            <p className="text-slate-500 max-w-sm text-sm">
              This shared room is empty or there are no items selected to share.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="bento-heading text-3xl font-semibold text-slate-900 md:text-4xl">
                {username ? `${username}'s Brain` : "Shared Brain"}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                {contents.length} item{contents.length !== 1 ? 's' : ''} shared
              </p>
            </div>
            
            <Masonry
              breakpointCols={{
                default: 4,
                1280: 4,
                1024: 3,
                768: 2,
                640: 1
              }}
              className="flex w-full -ml-3"
              columnClassName="pl-3 bg-clip-padding flex flex-col"
            >
              {contents.map((content) => (
                <div key={content._id} className="mb-3">
                  <Cards {...content} />
                </div>
              ))}
            </Masonry>
          </>
        )}
      </main>
    </div>
  );
};

export default SharePage;
