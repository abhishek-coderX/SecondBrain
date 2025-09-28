import { useEffect, useState } from "react";
import { Cards } from "../components/Cards";
import { CreateContentModal } from "../components/CreateContentModal";
import { PlusIcon } from "../components/icons/PlusIcon";
import { ShareIcon } from "../components/icons/ShareIcon";
import { Button } from "../components/ui/Button";
import type { Content } from "../types/type";
import { SideBar } from "../components/SideBar";
import axios from "axios";

import { ShareModal } from "../components/ShareModal";

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  
  useEffect(()=>{
    const fetchContent=async()=>{
    
       try {
const res = await axios.get('http://localhost:4000/content', {
          withCredentials: true, 
        });
        setContents(res.data)
      
      } catch (error) {
        setError('Failed to fetch your content. Please try again later.');
        console.error(error);
       }
 finally {
        setIsLoading(false);
      }
    }
    fetchContent()
  },[])

 const handleContentAdded = (newContent: Content) => {
    setContents((prevContents) => [newContent, ...prevContents]);
  };
  
const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">Loading your content...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    if (contents.length === 0) {
      return (
        <div className="text-center text-gray-500">
            <p>No content found.</p>
            <p>Click "Add Content" to get started!</p>
        </div>
      )
    }return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {contents.map((content) => (
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
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <main className="flex-1 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            size="md"
            variant="primary"
            text="Add Content"
            startIcon={<PlusIcon size="sm" />}
            onClick={() => setIsModalOpen(true)}
          />
          <Button
            size="md"
            variant="secondary"
            text="Share Content"
            startIcon={<ShareIcon size="sm" />}
            onClick={() => setIsShareModalOpen(true)}
          />
        </div>

        {renderContent()}

        <CreateContentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContentAdded={handleContentAdded}
        />
        <ShareModal
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          contents={contents}
        />
      </main>
    </div>
  );
};

export default Layout;