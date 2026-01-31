import Link from 'next/link';

interface CardProps {
  title: string;
  subtitle?: string;
  href: string;
  badges?: Array<{ label: string; color?: string }>;
  meta?: Array<{ label: string; value: string }>;
  children?: React.ReactNode;
}

const badgeColors: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
  emerald: 'bg-emerald-100 text-emerald-800',
};

export function Card({ title, subtitle, href, badges, meta, children }: CardProps) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-emerald-300 transition-all"
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {badges?.map((badge, index) => (
          <span
            key={index}
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              badgeColors[badge.color || 'gray']
            }`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{subtitle}</p>
      )}

      {meta && meta.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {meta.map((item, index) => (
            <span key={index}>
              <span className="font-medium">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>
      )}

      {children}
    </Link>
  );
}
