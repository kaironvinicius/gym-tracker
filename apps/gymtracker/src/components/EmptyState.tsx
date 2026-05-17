interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function isImageIcon(icon: string): boolean {
  return icon.startsWith('data:') || icon.startsWith('/');
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4">
          {isImageIcon(icon) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" className="w-16 h-16 object-contain mx-auto" />
          ) : (
            <span className="text-5xl">{icon}</span>
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gym-text mb-2">{title}</h3>
      {description && <p className="text-sm text-gym-muted mb-6 max-w-xs">{description}</p>}
      {action && action}
    </div>
  );
}
