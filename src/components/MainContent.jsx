import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { motion as Motion, useMotionValue, animate } from 'framer-motion';
import '../App.css';
import FlowerPetal from './FlowerPetal';
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const TOTAL_SEGMENTS = 13;
const ANGLE_STEP = 360 / TOTAL_SEGMENTS;
const WHEEL_INDEX_OFFSET = 0;
const DAY_MS = 1000 * 60 * 60 * 24;
const EMPTY_PETALS = Object.freeze([]);
const PETAL_CACHE_STORAGE_PREFIX = "petal-cache-v1";
const MONTH_SEGMENTS = [
  { startMonth: 0, startDay: 1, endMonth: 0, endDay: 28 },
  { startMonth: 0, startDay: 29, endMonth: 1, endDay: 25 },
  { startMonth: 1, startDay: 26, endMonth: 2, endDay: 24 },
  { startMonth: 2, startDay: 25, endMonth: 3, endDay: 21 },
  { startMonth: 3, startDay: 22, endMonth: 4, endDay: 19 },
  { startMonth: 4, startDay: 20, endMonth: 5, endDay: 16 },
  { startMonth: 5, startDay: 17, endMonth: 6, endDay: 14 },
  { startMonth: 6, startDay: 15, endMonth: 7, endDay: 11 },
  { startMonth: 7, startDay: 12, endMonth: 8, endDay: 8 },
  { startMonth: 8, startDay: 9, endMonth: 9, endDay: 6 },
  { startMonth: 9, startDay: 7, endMonth: 10, endDay: 3 },
  { startMonth: 10, startDay: 4, endMonth: 11, endDay: 1 },
  { startMonth: 11, startDay: 2, endMonth: 11, endDay: 29 }
];

const getTodaySegment = (referenceDate = new Date()) => {
  const year = referenceDate.getFullYear();
  const today = new Date(year, referenceDate.getMonth(), referenceDate.getDate());

  for (let monthIndex = 0; monthIndex < MONTH_SEGMENTS.length; monthIndex++) {
    const segment = MONTH_SEGMENTS[monthIndex];
    const startDate = new Date(year, segment.startMonth, segment.startDay);
    const endDate = new Date(year, segment.endMonth, segment.endDay);

    if (today >= startDate && today <= endDate) {
      return {
        monthIndex,
        dayNumber: Math.floor((today - startDate) / DAY_MS) + 1
      };
    }
  }

  return null;
};

const getPetalStorageKey = (cacheKey) => `${PETAL_CACHE_STORAGE_PREFIX}:${cacheKey}`;

const readPetalCacheFromStorage = (cacheKey) => {
  if (!cacheKey || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getPetalStorageKey(cacheKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writePetalCacheToStorage = (cacheKey, data) => {
  if (!cacheKey || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getPetalStorageKey(cacheKey), JSON.stringify(data));
  } catch {
    // localStorage erişimi quota veya privacy mode nedeniyle başarısız olabilir.
  }
};

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
  const isFirstRotation = useRef(true);
  const petalCacheRef = useRef(new Map());
  const todaySegment = useMemo(() => getTodaySegment(), []);
  const habitName = habit?.name ?? "";
  const [currentIndex, setCurrentIndex] = useState(() => todaySegment?.monthIndex ?? 0);
  const [petalsByDocId, setPetalsByDocId] = useState({});

  const getTargetAngleForIndex = useCallback((index) => (index + WHEEL_INDEX_OFFSET) * ANGLE_STEP, []);
  const getRotationForIndex = useCallback((index) => -getTargetAngleForIndex(index), [getTargetAngleForIndex]);

  const rotateToIndex = useCallback((index) => {
    const currentRotation = rotate.get();
    const currentAngle = ((-currentRotation % 360) + 360) % 360;
    const targetAngle = ((getTargetAngleForIndex(index) % 360) + 360) % 360;

    let delta = targetAngle - currentAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    animate(rotate, currentRotation - delta, {
      type: "spring",
      stiffness: 300,
      damping: 20
    });
  }, [getTargetAngleForIndex, rotate]);

  const handleLeft = () => {
    const newIndex = (currentIndex - 1 + TOTAL_SEGMENTS) % TOTAL_SEGMENTS;
    setCurrentIndex(newIndex);
  };

  const handleRight = () => {
    const newIndex = (currentIndex + 1) % TOTAL_SEGMENTS;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (isFirstRotation.current) {
      rotate.set(getRotationForIndex(currentIndex));
      isFirstRotation.current = false;
      return;
    }

    rotateToIndex(currentIndex);
  }, [currentIndex, getRotationForIndex, rotate, rotateToIndex]);

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

  const cacheKey = useMemo(() => (userId && habitName ? `${userId}::${habitName}` : ""), [userId, habitName]);

  const buildFlowerDocId = useCallback((monthIndex, uniqueKey, startNumber) => (
    `${userId}_${habitName}_${monthIndex}_${uniqueKey}_${startNumber}`
  ), [userId, habitName]);

  const handlePetalsChange = useCallback((docId, newPetals) => {
    setPetalsByDocId(prev => ({
      ...prev,
      [docId]: newPetals
    }));

    if (!cacheKey) return;
    const currentCached = petalCacheRef.current.get(cacheKey) || {};
    const nextCached = {
      ...currentCached,
      [docId]: newPetals
    };
    petalCacheRef.current.set(cacheKey, nextCached);
    writePetalCacheToStorage(cacheKey, nextCached);
  }, [cacheKey]);

  useLayoutEffect(() => {
    if (!cacheKey) {
      setPetalsByDocId({});
      return;
    }

    const cached = petalCacheRef.current.get(cacheKey);
    if (cached) {
      setPetalsByDocId(cached);
    } else {
      const persisted = readPetalCacheFromStorage(cacheKey);
      if (persisted) {
        petalCacheRef.current.set(cacheKey, persisted);
        setPetalsByDocId(persisted);
      } else {
        setPetalsByDocId({});
      }
    }

  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    let isCancelled = false;
    const fetchPetals = async () => {
      try {
        const petalsRef = collection(db, "flowerPetals");
        const petalsQuery = query(
          petalsRef,
          where("userId", "==", userId),
          where("habitName", "==", habitName)
        );
        const snapshot = await getDocs(petalsQuery);
        if (isCancelled) return;

        const nextPetalsMap = {};
        snapshot.forEach((snapshotDoc) => {
          const data = snapshotDoc.data();
          nextPetalsMap[snapshotDoc.id] = Array.isArray(data.petals) ? data.petals : [];
        });

        petalCacheRef.current.set(cacheKey, nextPetalsMap);
        writePetalCacheToStorage(cacheKey, nextPetalsMap);
        setPetalsByDocId(nextPetalsMap);
      } catch (error) {
        console.error("Firestore petals fetch error:", error);
      }
    };

    fetchPetals();

    return () => {
      isCancelled = true;
    };
  }, [cacheKey, habitName, userId]);

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
          <div className="tree-bg" aria-hidden="true" />
          <div className="controls">
            <div className="navigation">
              <button className='button' onClick={handleLeft}><BsArrowLeft /></button>
              <div className="month-display">{months[currentIndex]}</div>
              <button className='button' onClick={handleRight}><BsArrowRight /></button>
            </div>
          </div>

          <div className="wheel-stage">
            <Motion.div className="wheel" style={{ rotate }}>
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
                    <path
                      d={pathData}
                      fill={color}
                      stroke="#FFE2D0"
                      strokeWidth="0.4"
                    />

                    <g transform={`rotate(${rotation2}, 100, 100)`}
                    >
                      <path
                        d="M120.2,62 C100,50 130,30 105,20"
                        stroke="#FFE2D0"
                        strokeWidth="0.3"
                        fill="none"
                        opacity="0.5"
                      />
                      <path
                        d="M130 25 C 120 30, 98 55, 103 33 C 125 70, 99 55, 109.5 83"
                        stroke="#FFE2D0"
                        strokeWidth="0.3"
                        fill="none"
                        opacity="0.5"
                      />

                      <text
                        x="99"
                        y="18.5"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize="3"
                        fill="#1E1E1E"
                        transform={`rotate(${-rotation}, 100, 100)`}
                        className="select-none"
                      >
                        {month}
                      </text>
                    </g>
                  </g>
                );
              })}

              {months.map((month, i) => {
                const offsetAngle = -15;
                const rotation = (i * ANGLE_STEP) + offsetAngle;

                return (
                  <g key={`flowers-${i}`} transform={`rotate(${rotation}, 100, 100)`}>
                    {[1, 8, 15, 22].map((start, idx) => {
                      const flowerDocId = buildFlowerDocId(i, idx, start);
                      return (
                      <g key={idx} transform={`translate(${[107, 107, 123, 108][idx]}, ${[70, 50, 40, 29][idx]}) scale(1)`}>
                        <FlowerPetal
                          key={`${habit.name}_${i}_${idx}_${start}`}
                          docId={flowerDocId}
                          petalColor="#FFE2D0"
                          startNumber={start}
                          userId={userId}
                          habitName={habit.name}
                          monthIndex={i}
                          monthName={month}   // ✅ burası düzeltildi
                          uniqueKey={idx}
                          petalCount={7}
                          todaySegment={todaySegment}
                          initialSelectedPetals={petalsByDocId[flowerDocId] ?? EMPTY_PETALS}
                          onPetalsChange={handlePetalsChange}
                        />
                      </g>
                      );
                    })}
                  </g>
                );
              })}
              </svg>
            </Motion.div>

            <div className="absolute z-10 w-[190px] h-[190px] bg-[#FFE2D0] rounded-full flex justify-center items-center">
              <div className='w-[170px] h-[170px] bg-[#FFE2D0] border-[0.5px] border-[#1E1E1E]/50 rounded-full flex justify-center items-center'>
                <p className="text-[#1E1E1E] text-3xl font-semibold text-center select-none">Blossom days</p>
              </div>
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
