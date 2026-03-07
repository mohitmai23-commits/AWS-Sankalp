import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Common/Navbar';
import NormalContent from '../components/Content/NormalContent';
import SimplifiedContent from '../components/Content/SimplifiedContent';

export default function ContentPage({ simplified = false }) {
  const { topic, subtopic } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {simplified ? (
        <SimplifiedContent topic={topic} subtopic={subtopic} />
      ) : (
        <NormalContent topic={topic} subtopic={subtopic} />
      )}
    </div>
  );
}