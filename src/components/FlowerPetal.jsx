import { useEffect, useState } from "react";
import { db } from "../lib/firebase"; // kendi yoluna göre düzelt
import { doc, getDoc, setDoc } from "firebase/firestore";
import FlowerCenter from "./Flower/FlowerCenter";
import FlowerStem from "./Flower/FlowerStem";

const Icon = ({ petalColor = '#FFE2D0', petalCount = 7, startNumber = 1, storageKey = 'selectedPetals', userId = "demoUser", habitName
}) => {
  const radius = 2;
  const [selectedPetals, setSelectedPetals] = useState([]);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const currentMonthYear = getCurrentMonthYear();
  console.log("Aktif ay:", currentMonthYear);


  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "petalSelections", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[habitName]) {
          setSelectedPetals(data[habitName][currentMonthYear] || []);
        } else {
          // Yeni habit için alan oluştur
          await setDoc(docRef, {
            [habitName]: { [currentMonthYear]: [] },
          }, { merge: true });
          setSelectedPetals([]);
        }
      } else {
        await setDoc(docRef, {
          [habitName]: { [currentMonthYear]: [] },
        });
        setSelectedPetals([]);
      }
    };


    fetchData();
  }, [userId]);



  useEffect(() => {
    const saveData = async () => {
      const docRef = doc(db, "petalSelections", userId);
      await setDoc(docRef, {
        [habitName]: {
          [currentMonthYear]: selectedPetals,
        },
      }, { merge: true });
    };


    if (selectedPetals.length > 0) {
      saveData();
    }
  }, [selectedPetals, userId]);


  const togglePetal = (number) => {
    setSelectedPetals(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
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

export default Icon;
