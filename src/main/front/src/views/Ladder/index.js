import React, { useState } from "react";

export default function Ladder() {
    const [step, setStep] = useState(1); // 1: 인원 선택, 2: 옵션 입력, 3: 결과
    const [playerCount, setPlayerCount] = useState(3);
    const [topOptions, setTopOptions] = useState([]);
    const [bottomOptions, setBottomOptions] = useState([]);
    const [ladder, setLadder] = useState([]);
    const [results, setResults] = useState([]);

    // 인원 수 선택 완료
    const handleStart = () => {
        setTopOptions(Array(playerCount).fill(""));
        setBottomOptions(Array(playerCount).fill(""));
        setStep(2);
    };

    // 옵션 변경
    const handleTopChange  = (i, value) => {
        const copy = [...topOptions];
        copy[i] = value;
        setTopOptions(copy);
    };

    const handleBottomChange = (i, value) => {
        const copy = [...bottomOptions];
        copy[i] = value;
        setBottomOptions(copy);
    };

    // 사다리 랜덤 생성
    const generateLadder = () => {
        const rows = 12; // 총 줄 단계 (높이)
        const minGap = 1; // 같은 열에서는 최소 몇 줄 건너뛰고 다시 가로줄을 만들지

        // false 초기화
        let newLadder = Array(rows)
            .fill(null)
            .map(() => Array(playerCount - 1).fill(false));

        // 간격 유지 + 연속 방지 + 고른 분포
        for (let c = 0; c < playerCount - 1; c++) {
            let lastRow = -minGap;

            for (let r = 0; r < rows; r++) {
                // 1) 최소 간격 조건 충족 &
                // 2) 인접 세로줄과 겹치지 않게 &
                // 3) 전체적으로 고르게 배포되도록 조건 설정
                if (
                    r - lastRow >= minGap + 1 && // 줄 간격 확보
                    Math.random() < 0.5 && // 확률 조절 (너무 많지 않게)
                    !newLadder[r]?.[c - 1] && // 왼쪽 줄과 연속 방지
                    !newLadder[r]?.[c + 1] // 오른쪽 줄과 연속 방지
                ) {
                    newLadder[r][c] = true;
                    lastRow = r; // 마지막 줄 위치 갱신
                }
            }
        }

        setLadder(newLadder);
        calculateResults(newLadder);
        setStep(3);
    };



    // 결과 계산
    const calculateResults = (ladder) => {
        const finalResults = [];
        for (let start = 0; start < playerCount; start++) {
            let position = start;
            for (let r = 0; r < ladder.length; r++) {
                if (position > 0 && ladder[r][position - 1]) {
                    position -= 1;
                } else if (position < playerCount - 1 && ladder[r][position]) {
                    position += 1;
                }
            }
            finalResults.push(bottomOptions[position] || `결과${position + 1}`);
        }
        setResults(finalResults);
    };

    // 사다리 화면 렌더링
    const renderLadder = () => {
        const containerHeight = 400;
        const containerWidth = 400;
        const columnGap = containerWidth / (playerCount - 1);
        const verticalPadding = 40; // ✅ 위아래 여백

        return (
            <div
                style={{
                    position: "relative",
                    width: containerWidth,
                    height: containerHeight + verticalPadding * 2, // ✅ 전체 높이 증가
                    margin: "0 auto",
                }}
            >
                {/* ✅ 세로줄 */}
                {Array(playerCount)
                    .fill(null)
                    .map((_, colIndex) => (
                        <div
                            key={`col-${colIndex}`}
                            style={{
                                position: "absolute",
                                left: `${colIndex * columnGap}px`,
                                top: verticalPadding, // ✅ 세로줄 시작점 아래로 내림
                                width: 2,
                                height: containerHeight,
                                background: "#333",
                            }}
                        ></div>
                    ))}

                {/* ✅ 가로줄 */}
                {ladder.map((row, rIdx) =>
                    row.map(
                        (hasLine, cIdx) =>
                            hasLine && (
                                <div
                                    key={`line-${rIdx}-${cIdx}`}
                                    style={{
                                        position: "absolute",
                                        top: `${verticalPadding + (rIdx / ladder.length) * containerHeight}px`, // ✅ 패딩 적용
                                        left: `${cIdx * columnGap}px`,
                                        width: `${columnGap}px`,
                                        height: 2,
                                        background: "#333",
                                    }}
                                ></div>
                            )
                    )
                )}

                {/* 위 옵션 */}
                {topOptions.map((opt, i) => (
                    <div
                        key={`top-${i}`}
                        style={{
                            position: "absolute",
                            top: verticalPadding - 35, // ✅ 세로줄 위에서 약간 띄우기
                            left: `${i * columnGap - 30}px`,
                            width: 60,
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {opt || `참가자 ${i + 1}`}
                    </div>
                ))}

                {/* 아래 옵션 */}
                {bottomOptions.map((opt, i) => (
                    <div
                        key={`bottom-${i}`}
                        style={{
                            position: "absolute",
                            top: verticalPadding + containerHeight + 10, // ✅ 세로줄 아래에서 약간 띄우기
                            left: `${i * columnGap - 30}px`,
                            width: 60,
                            textAlign: "center",
                        }}
                    >
                        {opt || `결과 ${i + 1}`}
                    </div>
                ))}
            </div>
        );
    };

    // 1단계: 인원 수 선택
    if (step === 1) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>🪜 사다리 타기 시작</h1>
                <p>참여 인원 수를 선택하세요 (2~8명)</p>
                <input
                    type="number"
                    min={2}
                    max={8}
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    style={{ padding: 8, fontSize: 18, width: 80, textAlign: "center" }}
                />
                <br />
                <button
                    style={{
                        marginTop: 20,
                        padding: "10px 20px",
                        fontSize: 18,
                        cursor: "pointer",
                    }}
                    onClick={handleStart}
                >
                    옵션 설정하기 →
                </button>
            </div>
        );
    }

    // 2단계: 옵션 입력
    if (step === 2) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>옵션을 입력하세요</h1>

                {/* ✅ 참가자 입력 */}
                <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 20 }}>
                    {Array.from({ length: playerCount }).map((_, i) => (
                        <input
                            key={`top-${i}`}
                            type="text"
                            placeholder={`참가자 ${i + 1}`}
                            value={topOptions[i] || ""}
                            onChange={(e) => {
                                const newArr = [...topOptions];
                                newArr[i] = e.target.value;
                                setTopOptions(newArr);
                            }}
                            style={{ padding: 8, fontSize: 16, width: 100, textAlign: "center" }}
                        />
                    ))}
                </div>

                <div
                    style={{
                        position: "relative",
                        width: `${playerCount * 120}px`,
                        height: "400px",
                        margin: "40px auto",
                    }}
                >
                    {Array.from({ length: playerCount }).map((_, i) => (
                        <div
                            key={`line-${i}`}
                            style={{
                                position: "absolute",
                                left: `${(i / (playerCount - 1)) * 100}%`,
                                top: 0,
                                bottom: 0,
                                width: "2px",
                                background: "#333",
                            }}
                        ></div>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 20 }}>
                    {Array.from({ length: playerCount }).map((_, i) => (
                        <input
                            key={`bottom-${i}`}
                            type="text"
                            placeholder={`결과 ${i + 1}`}
                            value={bottomOptions[i] || ""}
                            onChange={(e) => {
                                const newArr = [...bottomOptions];
                                newArr[i] = e.target.value;
                                setBottomOptions(newArr);
                            }}
                            style={{ padding: 8, fontSize: 16, width: 100, textAlign: "center" }}
                        />
                    ))}
                </div>

                <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 20 }}>
                    {/* 돌아가기 버튼 */}
                    <button
                        style={{
                            padding: "12px 30px",
                            fontSize: 18,
                            cursor: "pointer",
                            background: "#888",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                        }}
                        onClick={() => setStep(1)} // ✅ 1단계로 이동
                    >
                        ↩ 돌아가기
                    </button>

                    {/* 사다리 시작 버튼 */}
                    <button
                        style={{
                            padding: "12px 30px",
                            fontSize: 18,
                            cursor: "pointer",
                            background: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                        }}
                        onClick={generateLadder}
                    >
                        🪜 사다리 시작
                    </button>
                </div>
            </div>
        );
    }

    // 3단계: 결과 화면
    if (step === 3) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>🪜 사다리 결과</h1>
                {renderLadder()}

                <button
                    style={{
                        marginTop: 30,
                        padding: "12px 30px",
                        fontSize: 18,
                        cursor: "pointer",
                        background: "#4caf50",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                    }}
                    onClick={() => setStep(4)}
                >
                    📜 전체 결과 보기
                </button>
            </div>
        );
    }

    // 4단계: 전체 결과 표시
    if (step === 4) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>📜 전체 결과</h1>
                <ul style={{ listStyle: "none", padding: 0, fontSize: 20 }}>
                    {topOptions.map((name, i) => (
                        <li key={i}>
                            <strong>{name || `참가자 ${i + 1}`}</strong> ➝{" "}
                            {results[i] || `결과 ${i + 1}`}
                        </li>
                    ))}
                </ul>

                <button
                    style={{
                        marginTop: 30,
                        padding: "12px 30px",
                        fontSize: 18,
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        setStep(1);
                        setResults([]);
                    }}
                >
                    🔄 다시 시작
                </button>
            </div>
        );
    }
}
