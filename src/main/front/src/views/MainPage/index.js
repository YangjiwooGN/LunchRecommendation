import React from "react";
import { Box, Container } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function MainPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 600px 이하 감지

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }}>
            {/* ✅ 1️⃣ 메인 배너 - 가로 전체 꽉 차게 */}
            <Box
                component="img"
                src={isMobile ? "/mobile_banner_1.png" : "/web_banner_1.png"}
                alt="메인 배너"
                sx={{
                    width: "100vw",
                    height: "auto",
                    display: "block",
                }}
            />

            {/* ✅ 3️⃣ 내 소개 배너 - 메인 아래에 이어 붙이기 */}
            <Box
                component="img"
                src={
                    isMobile
                        ? "/mobile_banner_2.png" // 📱 정사각형 모바일 소개 배너
                        : "/web_banner_2.png"    // 💻 가로형 웹 소개 배너
                }
                alt="양지우 소개 배너"
                sx={{
                    width: "100vw",
                    height: "auto",
                    display: "block",
                }}
            />
        </div>
    );
}
