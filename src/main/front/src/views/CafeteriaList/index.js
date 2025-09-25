import React, { useEffect, useState } from "react";

function CafeteriaList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // ✅ 이미지 모달 상태
    const [modalImage, setModalImage] = useState(null);

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
                {/* ◀ 왼쪽 화살표 */}
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
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                >
                    <h2>{current.name}</h2>
                    <p>주소: {current.address || "-"}</p>
                    <p>가격: {current.price || "-"}</p>
                    {current.imageUrl && (
                        <img
                            src={current.imageUrl}
                            alt={current.name}
                            style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: 4,
                                cursor: "pointer",
                                transition: "transform 0.2s",
                            }}
                            onClick={() => setModalImage(current.imageUrl)} // ✅ 클릭 시 팝업 열기
                        />
                    )}
                    <div>
                        <a href={current.postUrl} target="_blank" rel="noreferrer">
                            원문 보기
                        </a>
                    </div>
                </div>

                {/* ▶ 오른쪽 화살표 */}
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

            {/* ✅ 이미지 클릭 시 뜨는 팝업 (모달) */}
            {modalImage && (
                <div
                    onClick={() => setModalImage(null)} // ✅ 바깥 클릭 시 닫기
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        cursor: "pointer",
                    }}
                >
                    <img
                        src={modalImage}
                        alt="확대 이미지"
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: 8,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                            cursor: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()} // ✅ 이미지 클릭 시 닫히지 않도록
                    />
                </div>
            )}
        </div>
    );
}

export default CafeteriaList;
