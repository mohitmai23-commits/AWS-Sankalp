import PaginatedContentViewer from './PaginatedContentViewer';
import ContentSidebar from './ContentSidebar';

export default function NormalContent({ topic, subtopic }) {
  return (
    <div className="relative">
      <PaginatedContentViewer topic={topic} subtopic={subtopic} />

      {/* Sidebar for navigation */}
      <div className="fixed right-0 top-0 h-full">
        <ContentSidebar topic={topic} currentSubtopic={subtopic} />
      </div>
    </div>
  );
}