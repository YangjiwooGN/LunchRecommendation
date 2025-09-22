import React, { useEffect, useState } from "react";

function CafeteriaList() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("/api/cafeterias")
            .then((r) => r.json())
            .then(setItems)
            .catch(console.error);
    }, []);

    return (
        <div>
            <h1>구내식당 리스트</h1>
            {items.length === 0 ? <p>데이터가 없습니다.</p> : null}
            {items.map((x, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                    <h2>{x.name}</h2>
                    <p>주소: {x.address || "-"}</p>
                    <p>가격: {x.price || "-"}</p>
                    {x.imageUrl && (
                        <img src={x.imageUrl} alt={x.name} style={{ width: 240, height: "auto" }} />
                    )}
                    <div>
                        <a href={x.postUrl} target="_blank" rel="noreferrer">원문 보기</a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CafeteriaList;
