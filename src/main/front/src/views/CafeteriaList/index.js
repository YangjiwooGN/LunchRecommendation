import React, { useEffect, useState } from "react";

function CafeteriaList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch("http://localhost:8080/api/cafeterias")
            .then((r) => r.json())
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("API 호출 실패:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>로딩 중...</p>;
    if (items.length === 0) return <p>데이터가 없습니다.</p>;

    const prevItem = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    const nextItem = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const current = items[currentIndex];

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1>구내식당 리스트</h1>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}
            >
                {/* 왼쪽 화살표 */}
                <button
                    onClick={prevItem}
                    style={{
                        position: "absolute",
                        left: -50,
                        fontSize: 24,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    ◀
                </button>

                {/* 현재 아이템 */}
                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        padding: 16,
                        width: 400,
                    }}
                >
                    <h2>{current.name}</h2>
                    <p>주소: {current.address || "-"}</p>
                    <p>가격: {current.price || "-"}</p>
                    {current.imageUrl && (
                        <img
                            src={current.imageUrl}
                            alt={current.name}
                            style={{ width: "100%", height: "auto", borderRadius: 4 }}
                        />
                    )}
                    <div>
                        <a href={current.postUrl} target="_blank" rel="noreferrer">
                            원문 보기
                        </a>
                    </div>
                </div>

                {/* 오른쪽 화살표 */}
                <button
                    onClick={nextItem}
                    style={{
                        position: "absolute",
                        right: -50,
                        fontSize: 24,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    ▶
                </button>
            </div>

            {/* 하단 페이지 표시 */}
            <p style={{ marginTop: 10 }}>
                {currentIndex + 1} / {items.length}
            </p>
        </div>
    );
}

export default CafeteriaList;
