"use client";

import { useState } from "react";
import { MicButton, GlassCard } from "@/shared/ui";
import "@/shared/styles/scenario.css";

type ScenarioState = 0 | 1 | 2;

export default function ScenarioSelectPage() {
  const [currentState, setCurrentState] = useState<ScenarioState>(0);
  const [isListening, setIsListening] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);

  const handleMicClick = () => {
    // Fade out text
    setTextOpacity(0);

    setTimeout(() => {
      if (currentState === 0) {
        // 대기 -> 듣는 중
        setCurrentState(1);
        setIsListening(true);
      } else if (currentState === 1) {
        // 듣는 중 -> 다시 듣는 중(에러)
        setCurrentState(2);
        setIsListening(true);
      } else {
        // 에러 -> 다시 대기
        setCurrentState(0);
        setIsListening(false);
      }
      // Fade in text
      setTextOpacity(1);
    }, 300);
  };

  const getMainTitle = () => {
    if (currentState === 0) {
      return "어떤 상황을 연습하고 싶은지\n편하게 말해보세요.";
    }
    return "장소나 상황 또는 키워드로\n말씀해 주세요.";
  };

  const getSubDesc = () => {
    if (currentState === 0) {
      return "마이크를 누르면 바로 시작돼요";
    } else if (currentState === 1) {
      return "";
    }
    return "말랭이가 잘 이해하지 못했어요.";
  };

  return (
    <GlassCard
      withBackground={true}
      header={
        <>
          <div className="scenario-logo">MalangEE</div>
          <button className="btn-exit">대화 종료하기</button>
        </>
      }
      footer={<MicButton isListening={isListening} onClick={handleMicClick} size="md" />}
    >
      {/* Character */}
      <div className="character-box">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="charGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#f2fbff" />
              <stop offset="60%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fffde8" />
            </radialGradient>
          </defs>
          <path
            d="M100,28 C145,28 182,58 182,100 C182,142 148,172 100,172 C52,172 18,142 18,100 C18,58 55,28 100,28"
            fill="url(#charGrad)"
          />
          <circle cx="72" cy="94" r="9" fill="#1e1e2c" />
          <circle cx="128" cy="94" r="9" fill="#1e1e2c" />
          <path
            d="M90,122 Q100,130 110,122"
            fill="none"
            stroke="#1e1e2c"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Text Group */}
      <div className="text-group" style={{ opacity: textOpacity }}>
        <h1 className="scenario-title">{getMainTitle()}</h1>
        {currentState !== 1 && <p className="scenario-desc">{getSubDesc()}</p>}
      </div>
    </GlassCard>
  );
}
