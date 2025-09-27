import React, { useState, useRef } from "react";

export default function Roulette() {
    const [optionCount, setOptionCount] = useState(6);
    const [options, setOptions] = useState(Array(6).fill(""));
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [finished, setFinished] = useState(false);
    const wheelRef = useRef(null);

    // 누적 회전 상태
    const totalRotationRef = useRef(0);

    // ✅ 옵션 개수 변경
    const changeOptionCount = (delta) => {
        let newCount = Math.min(8, Math.max(2, optionCount + delta));
        setOptionCount(newCount);
        setOptions(Array(newCount).fill(""));
        setResult(null);
        setFinished(false);

        // ✅ 회전 각도 초기화
        totalRotationRef.current = 0;
        if (wheelRef.current) {
            wheelRef.current.style.transform = "rotate(0deg)";
        }
    };

    // ✅ 옵션 내용 변경
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // ✅ 돌리기 버튼 클릭
    const spinRoulette = () => {
        if (options.some((opt) => opt.trim() === "")) return;

        setSpinning(true);
        setResult(null);
        setFinished(false);

        const randomIndex = Math.floor(Math.random() * optionCount);
        const anglePerSlice = 360 / optionCount;
        const targetAngle = 360 - randomIndex * anglePerSlice - anglePerSlice / 2;

        // ✅ 매번 5바퀴 이상 회전
        totalRotationRef.current += 360 * 5 + targetAngle;

        wheelRef.current.style.transform = `rotate(${totalRotationRef.current}deg)`;

        setTimeout(() => {
            setSpinning(false);
            setResult(options[randomIndex]);
            setFinished(true); // ✅ 완료 상태
        }, 4000);
    };

    // ✅ 다시 돌리기 버튼 클릭
    const resetRoulette = () => {
        totalRotationRef.current = 0;
        if (wheelRef.current) {
            // 트랜지션 잠시 제거 → 초기화 애니메이션 없이 원래대로
            wheelRef.current.style.transition = "none";
            wheelRef.current.style.transform = "rotate(0deg)";

            // 다음 프레임에서 transition 다시 적용
            requestAnimationFrame(() => {
                wheelRef.current.style.transition = "transform 4s cubic-bezier(0.2, 0.9, 0.3, 1)";
            });
        }

        setResult(null);
        setFinished(false);
    };

    const allOptionsFilled = options.every((opt) => opt.trim() !== "");

    return (
        <div style={{ padding: "100px 20px", textAlign: "center" }}>
            <h1>🎯 룰렛 돌리기</h1>

            {/* 옵션 개수 조절 */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => changeOptionCount(-1)} disabled={optionCount <= 2}>-</button>
                <span style={{ margin: "0 12px", fontSize: "18px" }}>{optionCount}개</span>
                <button onClick={() => changeOptionCount(1)} disabled={optionCount >= 8}>+</button>
                <p style={{ fontSize: 14, color: "#555" }}>(2개 ~ 8개 설정 가능)</p>
            </div>

            {/* 룰렛 */}
            <div style={{ margin: "50px auto", position: "relative", width: 300, height: 300 }}>
                {/* 화살표 */}
                <div
                    style={{
                        position: "absolute",
                        top: -18,
                        left: "52%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "15px solid transparent",
                        borderRight: "15px solid transparent",
                        borderTop: "30px solid #000",
                        zIndex: 10,
                    }}
                ></div>

                <div
                    ref={wheelRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: "6px solid #333",
                        transition: "transform 4s cubic-bezier(0.2, 0.9, 0.3, 1)",
                        background: `conic-gradient(
              ${options
                            .map(
                                (opt, i) =>
                                    `${getColor(i)} ${i * (360 / optionCount)}deg ${(i + 1) * (360 / optionCount)}deg`
                            )
                            .join(",")}
            )`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    {options.map((opt, i) => {
                        const translateDistance =
                            optionCount <= 5 ? -90 : optionCount === 6 ? -100 : optionCount === 7 ? -120 : -130;

                        return (
                            <input
                                key={i}
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                placeholder={`옵션 ${i + 1}`}
                                style={{
                                    position: "absolute",
                                    transform: `rotate(${(360 / optionCount) * i + (360 / optionCount) / 2}deg)
                            translate(0, ${translateDistance}px)
                            rotate(-${(360 / optionCount) * i + (360 / optionCount) / 2}deg)`,
                                    width: 90,
                                    textAlign: "center",
                                    fontSize: 14,
                                    padding: "4px 4px",
                                    borderRadius: "6px",
                                    border: "2px solid #888",
                                    background: "white",
                                    outline: "none",
                                    cursor: "text",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 돌리기 버튼 */}
            {!finished && (
                <button
                    onClick={spinRoulette}
                    disabled={!allOptionsFilled || spinning}
                    style={{
                        padding: "12px 30px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        background: allOptionsFilled ? "#1976d2" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: allOptionsFilled ? "pointer" : "not-allowed",
                        transition: "0.3s",
                    }}
                >
                    {spinning ? "🎡 돌리는 중..." : "🎯 원판 돌리기"}
                </button>
            )}

            {/* 다시 돌리기 버튼 */}
            {finished && (
                <button
                    onClick={resetRoulette}
                    style={{
                        padding: "12px 30px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        background: "#555",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginTop: 20,
                    }}
                >
                    🔄 다시 돌리기
                </button>
            )}

            {/* 결과 */}
            {result && (
                <h2 style={{ marginTop: 30, fontSize: 24, color: "#d32f2f" }}>
                    ✅ 당첨: <strong>{result}</strong>
                </h2>
            )}
        </div>
    );
}

// ✅ 색상 팔레트 함수
function getColor(index) {
    const colors = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#4ade80"];
    return colors[index % colors.length];
}
