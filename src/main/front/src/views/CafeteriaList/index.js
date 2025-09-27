import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Container,
    Dialog,
    useMediaQuery,
    Button,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTheme } from "@mui/material/styles";

export default function CafeteriaList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalImage, setModalImage] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // ✅ 600px 이하

    // 터치 시작 좌표 저장용
    const [touchStartX, setTouchStartX] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/cafeterias")
            .then((r) => r.json())
            .then((data) => {
                // ✅ 우선순위 식당 이름 리스트
                const priorityNames = [
                    "에이스테크노타워10차 구내식당 더푸드스케치",
                    "가산DK테라타워 구내식당 아이밀",
                    "어반워크 구내식당 다시봄"
                ];

                const priorityItems = priorityNames
                    .map(name => data.find(item => item.name === name))
                    .filter(Boolean);

                const remainingItems = data.filter(
                    item => !priorityNames.includes(item.name)
                );

                const sortedData = [...priorityItems, ...remainingItems];
                setItems(sortedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("API 호출 실패:", err);
                setLoading(false);
            });
    }, []);

    // 현재 시간 체크
    const now = new Date();
    const currentHour = now.getHours();
    const isBefore11 = currentHour < 11;

    if (loading) return <Typography align="center">로딩 중...</Typography>;

    // 아침 11시 전이고, 데이터가 아직 없을 때 → 안내 문구만 표시
    if (isBefore11 && items.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    🍱 매일 오전 11시에 최신화됩니다
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    현재는 식당 데이터가 준비되지 않았습니다.
                    <br />11시 이후에 다시 확인해주세요!
                </Typography>
            </Container>
        );
    }
    if (items.length === 0) return <Typography align="center">데이터가 없습니다.</Typography>;

    const prevItem = () => setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    const nextItem = () => setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));

    const current = items[currentIndex];

    // 스와이프 시작 이벤트
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    // 스와이프 종료 이벤트
    const handleTouchEnd = (e) => {
        if (touchStartX === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;

        // 일정 이상 움직였을 때만 동작 (30px 이상)
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) {
                // 왼쪽 → 오른쪽 스와이프 → 다음
                nextItem();
            } else {
                // 오른쪽 → 왼쪽 스와이프 → 이전
                prevItem();
            }
        }

        setTouchStartX(null);
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant={isMobile ? "h5" : "h4"} align="center" fontWeight="bold" mb={4}>
                🍱 구내식당 메뉴
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    gap: 2,
                    touchAction: "pan-y", // 세로 스크롤과 충돌 방지
                }}
                onTouchStart={isMobile ? handleTouchStart : undefined}
                onTouchEnd={isMobile ? handleTouchEnd : undefined}
            >
                {/* ◀ 이전 버튼 (데스크탑만) */}
                {!isMobile && (
                    <IconButton onClick={prevItem} sx={{ position: "absolute", left: -20 }}>
                        <ArrowBackIosNewIcon fontSize="large" />
                    </IconButton>
                )}

                {/* 메인 카드 */}
                <Card
                    sx={{
                        width: isMobile ? "100%" : 500,
                        borderRadius: 4,
                        boxShadow: 4,
                        overflow: "hidden",
                    }}
                >
                    {current.imageUrl && (
                        <CardMedia
                            component="img"
                            image={current.imageUrl}
                            alt={current.name}
                            sx={{
                                width: "100%",
                                maxHeight: isMobile ? "auto" : "100%",
                                objectFit: "contain", // ✅ 전체 이미지 표시
                                cursor: "pointer",
                                "&:hover": { opacity: 0.9 },
                            }}
                            onClick={() => setModalImage(current.imageUrl)}
                        />
                    )}
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {current.name}
                        </Typography>
                        <Typography variant="body1">📍 주소: {current.address || "-"}</Typography>
                        <Typography variant="body1">💰 가격: {current.price || "-"}</Typography>
                    </CardContent>
                </Card>

                {/* ▶ 다음 버튼 (데스크탑만) */}
                {!isMobile && (
                    <IconButton onClick={nextItem} sx={{ position: "absolute", right: -20 }}>
                        <ArrowForwardIosIcon fontSize="large" />
                    </IconButton>
                )}
            </Box>

            {/* 모바일 전용 하단 네비게이션 */}
            {isMobile && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button onClick={prevItem} variant="outlined" startIcon={<ArrowBackIosNewIcon />}>
                        이전
                    </Button>
                    <Typography sx={{ mt: 1 }}>
                        {currentIndex + 1} / {items.length}
                    </Typography>
                    <Button onClick={nextItem} variant="outlined" endIcon={<ArrowForwardIosIcon />}>
                        다음
                    </Button>
                </Box>
            )}

            {/* 데스크탑 페이지 표시 */}
            {!isMobile && (
                <Typography align="center" sx={{ mt: 2, color: "gray" }}>
                    {currentIndex + 1} / {items.length}
                </Typography>
            )}

            {/* 이미지 모달 */}
            <Dialog open={Boolean(modalImage)} onClose={() => setModalImage(null)} maxWidth="md">
                <Box
                    component="img"
                    src={modalImage}
                    alt="확대 이미지"
                    sx={{
                        maxWidth: "90vw",
                        maxHeight: "80vh",
                        objectFit: "contain",
                        p: 2,
                    }}
                />
            </Dialog>
        </Container>
    );
}
