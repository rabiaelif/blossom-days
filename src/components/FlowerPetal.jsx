import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import FlowerCenter from "./Flower/FlowerCenter";
import FlowerStem from "./Flower/FlowerStem";

const FlowerPetal = ({
  petalColor = '#FFE2D0',
  petalCount = 7, // Eksikti, ekledim
  startNumber = 1,
  userId = "demoUser",
  habitName,
  monthIndex,
  uniqueKey // Her çiçek için unique identifier
}) => {
  const radius = 2;
  const [selectedPetals, setSelectedPetals] = useState([]);

  // 🔥 UNIQUE Firestore document ID oluştur
  const getDocId = () => {
    return `${userId}_${habitName}_month${monthIndex}_key${uniqueKey}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !habitName) return;

      try {
        const docId = getDocId(); // Unique ID'yi kullan
        const docRef = doc(db, "flowerPetals", docId); // Yeni collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedPetals(data.petals || []);
        } else {
          // Yeni doküman oluştur
          await setDoc(docRef, {
            userId,
            habitName,
            monthIndex,
            uniqueKey,
            petals: [],
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };

    fetchData();
  }, [userId, habitName, monthIndex, uniqueKey]);

  const togglePetal = async (number) => {
    const newSelectedPetals = selectedPetals.includes(number)
      ? selectedPetals.filter(n => n !== number)
      : [...selectedPetals, number];

    setSelectedPetals(newSelectedPetals);

    // Firestore'a kaydet
    try {
      const docId = getDocId();
      await setDoc(
        doc(db, "flowerPetals", docId),
        { 
          petals: newSelectedPetals,
          lastUpdated: new Date()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Veri kaydetme hatası:", error);
    }
  };

  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (2 * Math.PI * i) / petalCount;
    const angleDeg = (angle * 180) / Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const petalNumber = startNumber + i;

    petals.push(
      <g key={i} transform={`translate(${x}, ${y}) rotate(${angleDeg})`} onClick={() => togglePetal(petalNumber)} style={{ cursor: "pointer" }}>
        <ellipse
          cx="2"
          cy="0"
          rx="3"
          ry="1.2"
          fill={selectedPetals.includes(petalNumber) ? "#FC4444" : petalColor}
          stroke={selectedPetals.includes(petalNumber) ? "#A61111" : "none"}
          strokeWidth="0.2"
        />
        <line
          x1="-1"
          y1="0"
          x2="0.5"
          y2="0.1"
          stroke={selectedPetals.includes(petalNumber) ? "#A61111" : "#FFC5A1"}
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