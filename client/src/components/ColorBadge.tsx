interface ColorBadgeProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function ColorBadge({ color, size = 'md' }: ColorBadgeProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full border-2 border-gray-700`}
      style={{ backgroundColor: color }}
    />
  );
}
