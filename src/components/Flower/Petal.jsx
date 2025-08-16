const Petal = ({ angleDeg, petalNumber, isSelected, petalColor, onClick }) => (
  <g transform={`rotate(${angleDeg})`} onClick={onClick} style={{ cursor: "pointer" }}>
    <ellipse
      cx="2"
      cy="0"
      rx="3"
      ry="1.2"
      fill={isSelected ? "#FC4444" : petalColor}
      stroke={isSelected ? "#A61111" : "none"}
      strokeWidth="0.2"
    />
    <line
      x1="-1"
      y1="0"
      x2="0.5"
      y2="0.1"
      stroke={isSelected ? "#A61111" : "#FFC5A1"}
      strokeWidth="0.7"
      strokeLinecap="round"
    />
    <g transform={`rotate(${-angleDeg}, 2.2, 0)`}>
      <text
        x="2.2"
        y="0"
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize="1.4"
        fill="#1E1E1E"
        fontWeight="semibold"
        fontFamily="Arial, sans-serif"
        style={{ userSelect: 'none' }}
      >
        {petalNumber}
      </text>
    </g>
  </g>
);
export default Petal;