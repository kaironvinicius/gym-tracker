'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
  backHref,
  rightElement,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-gym-surface border-b border-gym-border">
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gym-border transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <svg
                className="w-6 h-6 text-gym-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gym-text truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gym-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightElement && <div className="flex-shrink-0 ml-2">{rightElement}</div>}
      </div>
    </header>
  );
}
