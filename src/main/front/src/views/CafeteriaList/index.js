import React, { useEffect, useState } from "react";

function CafeteriaList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1>구내식당 리스트</h1>
            {items.length === 0 && <p>데이터가 없습니다.</p>}

            {items.map((x, i) => (
                <div
                    key={i}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 20,
                    }}
                >
                    <h2>{x.name}</h2>
                    <p>주소: {x.address || "-"}</p>
                    <p>가격: {x.price || "-"}</p>
                    {x.imageUrl && (
                        <img
                            src={x.imageUrl}
                            alt={x.name}
                            style={{ width: 240, height: "auto", borderRadius: 4 }}
                        />
                    )}
                    <div>
                        <a href={x.postUrl} target="_blank" rel="noreferrer">
                            원문 보기
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CafeteriaList;
