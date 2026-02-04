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
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  purple: 'bg-violet-50 text-violet-700',
  yellow: 'bg-amber-50 text-amber-700',
  red: 'bg-rose-50 text-rose-700',
  gray: 'bg-gray-100 text-gray-600',
  emerald: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
};

export function Card({ title, subtitle, href, badges, meta, children }: CardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                badgeColors[badge.color || 'gray']
              }`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-teal-700 transition-colors">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{subtitle}</p>
      )}

      {meta && meta.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {meta.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-1">
              <span className="font-semibold text-gray-700">{item.label}:</span>
              <span>{item.value}</span>
            </span>
          ))}
        </div>
      )}

      {children}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-700">
        View details
        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
