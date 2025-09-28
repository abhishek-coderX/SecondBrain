
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Cards } from '../components/Cards';
import { Content } from '../types/type';

const SharePage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/share/${shareId}`);
        setContents(res.data.contents);
      } catch (error) {
        setError('Failed to fetch shared content. The link may be invalid or expired.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">Loading shared content...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    if (contents.length === 0) {
      return <p className="text-center text-gray-500">No content has been shared.</p>;
    }

    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {contents.map(content => (
          <div key={content._id} className="break-inside-avoid mb-6">
            <Cards
              title={content.title}
              tags={content.tags}
              link={content.link}
              type={content.type}
              description={content.description}
              dateAdded={new Date(content.createdAt).toLocaleDateString()}
              author={content.userId.username}
              thumbnail={content.thumbnail}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Shared Content</h1>
      {renderContent()}
    </div>
  );
};

export default SharePage;
