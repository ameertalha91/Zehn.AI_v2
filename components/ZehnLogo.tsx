interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ZehnLogo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Logo based on the hexagonal network design from the attachment */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Main hexagon */}
        <path
          d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z"
          fill="#14b8a6"
          stroke="#0d9488"
          strokeWidth="2"
        />
        
        {/* Network nodes */}
        <circle cx="50" cy="35" r="8" fill="white" />
        <circle cx="50" cy="65" r="6" fill="white" />
        <circle cx="35" cy="25" r="4" fill="#06b6d4" />
        <circle cx="65" cy="25" r="4" fill="#06b6d4" />
        <circle cx="35" cy="75" r="4" fill="#06b6d4" />
        <circle cx="65" cy="75" r="4" fill="#06b6d4" />
        
        {/* Connection lines */}
        <line x1="50" y1="35" x2="35" y2="25" stroke="white" strokeWidth="2" />
        <line x1="50" y1="35" x2="65" y2="25" stroke="white" strokeWidth="2" />
        <line x1="50" y1="65" x2="35" y2="75" stroke="white" strokeWidth="2" />
        <line x1="50" y1="65" x2="65" y2="75" stroke="white" strokeWidth="2" />
        <line x1="50" y1="35" x2="50" y2="65" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
}
