interface LastUpdatedProps {
  date: string | null;
}

export function LastUpdated({ date }: LastUpdatedProps) {
  if (!date) return null;

  const updatedDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - updatedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeAgo: string;
  if (diffDays === 0) {
    timeAgo = 'today';
  } else if (diffDays === 1) {
    timeAgo = 'yesterday';
  } else if (diffDays < 7) {
    timeAgo = `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    timeAgo = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = updatedDate.toLocaleDateString();
  }

  return (
    <span className="text-xs text-gray-500">
      Last updated: {timeAgo}
    </span>
  );
}
