import { IconSizeVariant, type IconProp } from "./Index";

// One Piece style: Jolly Roger-inspired brain with crossed bones aesthetic
export const Logo = (props: IconProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={IconSizeVariant[props.size]}
    >
      {/* Skull-brain circle */}
      <circle cx="20" cy="16" r="10" fill="#d4a017" opacity="0.15" stroke="#d4a017" strokeWidth="1.5" />
      {/* Brain lobes */}
      <ellipse cx="16" cy="15" rx="5.5" ry="6.5" fill="#d4a017" opacity="0.9" />
      <ellipse cx="24" cy="15" rx="5.5" ry="6.5" fill="#d4a017" opacity="0.9" />
      {/* Division line */}
      <line x1="20" y1="9" x2="20" y2="22" stroke="#0a1628" strokeWidth="1.4" />
      {/* Crossed bones */}
      <line x1="8" y1="30" x2="32" y2="26" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="8" y1="26" x2="32" y2="30" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Bone ends */}
      <circle cx="8" cy="28" r="2.5" fill="#d4a017" opacity="0.7" />
      <circle cx="32" cy="28" r="2.5" fill="#d4a017" opacity="0.7" />
    </svg>
  );
};
