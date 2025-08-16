const FlowerStem = () => (
  <>
    <path
      d="M 0.7 3.2 C 1 5, 2 6, 0.7 7 C -0.1 8, 0 8, 0.7 10"
      stroke="#4E3E2E"
      strokeOpacity={0.8}
      strokeWidth="0.4"
      fill="none"
    />
    <path
      d="M 2 7.5 C 1 8, 0 8, 0.7 10"
      stroke="#4E3E2E"
      strokeOpacity={0.5}
      strokeWidth="0.4"
      fill="none"
    />
    <line x1="-0.9" y1="8.5" x2="0.3" y2="9" stroke="#4E3E2E" strokeOpacity={0.5} strokeWidth="0.4" />
    <g transform="translate(0, 10) scale(0.02)">
      <g transform="translate(-40,25) scale(-1,1) rotate(-110)">
        <path
          d="M100 20 C60 50,60 100,70 120 C90 170,140 150,140 150 C180 70,120 60,100 20 M100 20 C120 60,120 100,120 120"
          fill="#5C913B"
        />
      </g>
      <g transform="translate(100,-25) rotate(-110)">
        <path
          d="M100 20 C60 50,60 100,70 120 C90 170,140 150,140 150 C180 70,120 60,100 20 M100 20 C120 60,120 100,120 120"
          fill="#5C913B"
        />
      </g>
    </g>
  </>
);
export default FlowerStem;