import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import FlowerCenter from "./Flower/FlowerCenter";
import FlowerStem from "./Flower/FlowerStem";

// 🔥 SABIT INDEX DOGRULAMA
const validateMonthIndex = (index, monthName) => {
  const months = [
    "Jan 1 - Jan 28", "Jan 29 - Feb 25", "Feb 26 - Mar 24",
    "Mar 25 - Apr 21", "Apr 22 - May 19", "May 20 - Jun 16",
    "Jun 17 - Jul 14", "Jul 15 - Aug 11", "Aug 12 - Sep 8",
    "Sep 9 - Oct 6", "Oct 7 - Nov 3", "Nov 4 - Dec 1",
    "Dec 2 - Dec 29"
  ];

  return months[index] === monthName;
};

const FlowerPetal = ({
  petalColor = '#FFE2D0',
  petalCount = 7,
  startNumber = 1,
  userId = "demoUser",
  habitName,
  monthIndex, // 🔥 SABIT INDEX
  monthName,
  uniqueKey,
  todaySegment,
  docId,
  initialSelectedPetals = [],
  onPetalsChange
}) => {
  const radius = 2;
  const [selectedPetals, setSelectedPetals] = useState(initialSelectedPetals);

  // 🔥 INDEX DOGRULAMA
  useEffect(() => {
    const isValid = validateMonthIndex(monthIndex, monthName);
    if (!isValid) {
      console.error("❌ INDEX HATASI:", { monthIndex, monthName });
    }
  }, [monthIndex, monthName]);

  useEffect(() => {
    setSelectedPetals(initialSelectedPetals);
  }, [initialSelectedPetals, docId]);

  const togglePetal = async (number) => {
    const isAlreadySelected = selectedPetals.some(n => Number(n) === number);
    const newSelectedPetals = isAlreadySelected
      ? selectedPetals.filter(n => Number(n) !== number)
      : [...selectedPetals, number];

    setSelectedPetals(newSelectedPetals);
    if (onPetalsChange && docId) {
      onPetalsChange(docId, newSelectedPetals);
    }
    if (!docId) return;

    try {
      await setDoc(
        doc(db, "flowerPetals", docId),
        {
          userId,
          habitName,
          monthIndex, // 🔥 SABIT INDEX
          monthName,
          uniqueKey,
          startNumber,
          petals: newSelectedPetals,
          lastUpdated: new Date()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("❌ Kaydetme hatası:", error);
    }
  };

  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (2 * Math.PI * i) / petalCount;
    const angleDeg = (angle * 180) / Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const petalNumber = startNumber + i;
    const isSelected = selectedPetals.some(n => Number(n) === petalNumber);
    const isTodayPetal = Boolean(
      todaySegment &&
      todaySegment.monthIndex === monthIndex &&
      todaySegment.dayNumber === petalNumber
    );
    const petalFill = isSelected ? "#FC4444" : isTodayPetal ? "#FFE26B" : petalColor;
    const petalStroke = isTodayPetal ? "#7A4A00" : isSelected ? "#A61111" : "none";
    const petalStrokeWidth = isTodayPetal ? "0.45" : "0.2";
    const petalLineStroke = isTodayPetal ? "#7A4A00" : isSelected ? "#A61111" : "#FFC5A1";
    const petalTextFill = isTodayPetal ? "#7A2E00" : "#1E1E1E";

    petals.push(
      <g key={i} transform={`translate(${x}, ${y}) rotate(${angleDeg})`} onClick={() => togglePetal(petalNumber)} style={{ cursor: "pointer" }}>
        {isTodayPetal && (
          <ellipse
            cx="2"
            cy="0"
            rx="3.45"
            ry="1.65"
            fill="none"
            stroke="#FFD166"
            strokeWidth="0.22"
          />
        )}
        <ellipse
          cx="2"
          cy="0"
          rx="3"
          ry="1.2"
          fill={petalFill}
          stroke={petalStroke}
          strokeWidth={petalStrokeWidth}
        />
        <line
          x1="-1"
          y1="0"
          x2="0.5"
          y2="0.1"
          stroke={petalLineStroke}
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
            fill={petalTextFill}
            fontWeight="semibold"
            fontFamily="Arial, sans-serif"
            style={{ userSelect: 'none' }}
          >
            {petalNumber}
          </text>
        </g>
      </g>
    );
  }

  return (
    <g>
      {petals}
      <FlowerCenter />
      <FlowerStem />
    </g>
  );
};

export default FlowerPetal;
