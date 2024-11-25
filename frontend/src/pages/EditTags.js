import React, { useState, useEffect } from "react";
import StyledTagsDisplay from "../components/StyledTagsDisplay";

const EditTags = () => {
  const goingOut = [
    "Bars", "Cafe-hopping", "Clubs", "Concerts", "Festivals",
    "Karaoke", "Museums & galleries", "Stand up", "Theater"
  ];
  
  const activities = [
    "Gym", "Badminton", "Baseball", "Basketball", "Bouldering",
    "Volleyball", "Boxing", "Football", "Soccer", "Yoga"
  ];
  
  const stayingIn = [
    "Reading", "Video games", "Board games", "Cooking", "Baking",
    "Meditation", "Puzzle solving", "Movie watching", "TV binge watching",
    "Knitting", "Podcasts", "Journaling", "Scrapbooking", "DIY projects",
    "Online shopping"
  ];

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/getProfile?username=${username}`);
        const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
          setSelectedTags(result.profile.tags || []);
        } else {
          setError(result.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.log(err);
        setError("ERROR. check logs");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleAddTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const InteractiveTagsDisplay = ({ tags, onClick, isSelectable }) => {
    const wrappedTags = tags.map(tag => ({
      content: tag,
      onClick: () => onClick(tag)
    }));

    return (
      <div style={{ cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
        <StyledTagsDisplay 
          tags={wrappedTags.map(({ content }) => 
            isSelectable ? content : `${content} ✕`
          )} 
        />
      </div>
    );
  };

  const TagSection = ({ title, tags, isSelectable = true }) => (
    <div className="mb-6 w-full max-w-2xl">
      <div className="mb-3 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <InteractiveTagsDisplay 
        tags={tags}
        onClick={isSelectable ? handleAddTag : handleRemoveTag}
        isSelectable={isSelectable}
      />
    </div>
  );

  if (loading) return <div className="flex justify-center p-4">Loading...</div>;
  if (error) return <div className="flex justify-center p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center" style={{marginLeft:"350px"}}>
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Your Tags</h1>
        
        {/* Selected Tags Section */}
        <TagSection 
          title="Your Selected Tags" 
          tags={selectedTags} 
          isSelectable={false}
        />

        {/* Available Tags Sections */}
        <TagSection 
          title="Going Out" 
          tags={goingOut.filter(tag => !selectedTags.includes(tag))} 
        />
        <TagSection 
          title="Activities" 
          tags={activities.filter(tag => !selectedTags.includes(tag))} 
        />
        <TagSection 
          title="Staying In" 
          tags={stayingIn.filter(tag => !selectedTags.includes(tag))} 
        />
      </div>
    </div>
  );
};

export default EditTags;