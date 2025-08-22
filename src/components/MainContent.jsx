import { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import '../App.css';
import FlowerPetal from './FlowerPetal';
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

const TOTAL_SEGMENTS = 13;
const ANGLE_STEP = 360 / TOTAL_SEGMENTS;

function MainContent({ habit, userId }) { // userId props olarak alıyoruz
  const months = [
    "Jan 1 - Jan 28", "Jan 29 - Feb 25", "Feb 26 - Mar 24",
    "Mar 25 - Apr 21", "Apr 22 - May 19", "May 20 - Jun 16",
    "Jun 17 - Jul 14", "Jul 15 - Aug 11", "Aug 12 - Sep 8",
    "Sep 9 - Oct 6", "Oct 7 - Nov 3", "Nov 4 - Dec 1",
    "Dec 2 - Dec 29"
  ];

  const colors = [
    '#FFB88C', '#A3D977', '#0077B6', '#6A0572', '#F0A202',
    '#8093F1', '#FF6F61', '#FFD275', '#80CED7', '#023E8A',
    '#9A031E', '#CFCFCF', '#3D348B'
  ];

  const rotate = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [habits, setHabits] = useState([]);


  const rotateToIndex = (index) => {
    const currentRotation = rotate.get();
    const currentAngle = -currentRotation % 360;
    const targetAngle = index * ANGLE_STEP;

    let delta = targetAngle - currentAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    animate(rotate, currentRotation - delta, { type: "spring", stiffness: 300 });
  };

  const handleLeft = () => {
    const newIndex = (currentIndex - 1 + TOTAL_SEGMENTS) % TOTAL_SEGMENTS;
    setCurrentIndex(newIndex);
    rotateToIndex(newIndex);
  };

  const handleRight = () => {
    const newIndex = (currentIndex + 1) % TOTAL_SEGMENTS;
    setCurrentIndex(newIndex);
    rotateToIndex(newIndex);
  };

  // responsive grid
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.habit-container');
      if (container) {
        container.style.gridTemplateColumns = window.innerWidth < 768 ? '1fr' : '1fr 1fr';
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Firestore'dan alışkanlıkları çek
  useEffect(() => {
    if (!userId) return;

    const fetchHabits = async () => {
      try {
        const habitsRef = collection(db, "users", userId, "habits");
        const snapshot = await getDocs(habitsRef);
        const habitsData = [];

        snapshot.forEach((doc) => {
          habitsData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setHabits(habitsData);
      } catch (error) {
        console.error("Firestore fetch error:", error);
      }
    };

    fetchHabits();
  }, [userId]);


  // Yaprak güncelleme
  const handleUpdate = async (habitId, newPetals) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, petals: newPetals } : h)
    );

    try {
      await setDoc(
        doc(db, "users", userId, "habits", habitId),
        { petals: newPetals },
        { merge: true }
      );
    } catch (error) {
      console.error("Firestore update error:", error);
    }
  };

  function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const adjustedStart = startAngle - 0.1;
    const adjustedEnd = endAngle + 0.1;
    const start = polarToCartesian(cx, cy, r, adjustedEnd);
    const end = polarToCartesian(cx, cy, r, adjustedStart);
    const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? '0' : '1';

    return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ');
  }

  return (
    <div className="habit-container">
      {habit ? (
        <div className="tree-container justify-center items-center relative flex flex-col">
          <div className="controls">
            <div className="navigation">
              <button className='button' onClick={handleLeft}><BsArrowLeft /></button>
              <div className="month-display">{months[currentIndex]}</div>
              <button className='button' onClick={handleRight}><BsArrowRight /></button>
            </div>
          </div>

          <motion.div className="wheel" style={{ rotate }} initial={{ rotate: 0 }}>
            <svg viewBox="0 0 200 200" className="wheel-svg" preserveAspectRatio="xMidYMid meet">
              {months.map((month, i) => {
                const offsetAngle = -15;
                const rotation = (i * ANGLE_STEP) + offsetAngle;
                const rotation2 = (i * ANGLE_STEP);
                const color = colors[i % colors.length];
                const startAngle = i * ANGLE_STEP;
                const endAngle = (i + 1) * ANGLE_STEP;
                const pathData = describeArc(100, 100, 80, startAngle, endAngle);

                return (
                  <g key={i} transform={`rotate(${rotation}, 100, 100)`}>
                    <path d={pathData} fill={color} stroke="#FFE2D0" strokeWidth="0.4" />
                    <g transform={`rotate(${rotation2}, 100, 100)`}>
                      <path d="M120.2,62 C100,50 130,30 105,20" stroke="#FFE2D0" strokeWidth="0.3" fill="none" opacity="0.5" />
                      <path d="M130 25 C 120 30, 98 55, 103 33 C 125 70, 99 55, 109.5 83" stroke="#FFE2D0" strokeWidth="0.3" fill="none" opacity="0.5" />
                      <text x="99" y="18.5" textAnchor="middle" alignmentBaseline="middle" fontSize="3" fill="#1E1E1E" transform={`rotate(${-rotation}, 100, 100)`} className='select-none'>
                        {months[i]}
                      </text>
                      {[1, 8, 15, 22].map((start, idx) => (
                        <g key={idx} transform={`translate(${[107, 107, 123, 108][idx]}, ${[70, 50, 40, 29][idx]}) scale(1)`}>
                          <FlowerPetal
                            petalColor="#FFE2D0"
                            startNumber={start}
                            userId={userId}
                            habitName={habit.name}
                            monthIndex={i}
                            uniqueKey={idx} // 🔥 Her çiçek için unique key
                            petalCount={7} // 🔥 Yaprak sayısını belirt
                          />
                        </g>
                      ))}

                    </g>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          <div className="absolute z-10 w-[190px] h-[190px] bg-[#FFE2D0] rounded-full flex justify-center items-center">
            <div className='w-[170px] h-[170px] bg-[#FFE2D0] border-[0.5px] border-[#1E1E1E]/50 rounded-full flex justify-center items-center'>
              <p className="text-[#1E1E1E] text-3xl font-semibold text-center select-none">Blossom days</p>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="text-xl text-gray-500">No habit selected</h2>
      )}
    </div>
  );
}

export default MainContent;
