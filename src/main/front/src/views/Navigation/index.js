// 화면 최상단 네비게이션 바
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    IconButton,
} from '@mui/material';
import { useNavigate } from "react-router-dom";

export default function Navigation() {
    const navigate = useNavigate();

    const naviButtonStyle = {
        bgcolor: '#ffffffff',
        color: 'black',
        fontWeight: 'bold',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#eeeeeeff' },
        textTransform: 'none',
    };

    return (
        <AppBar
            position="fixed"
            elevation={1}
            sx={{ backgroundColor: 'white', color: 'black' }}
        >
            {/* ✅ relative로 변경해서 내부에서 absolute 배치 가능 */}
            <Toolbar sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                {/* 왼쪽 끝 로고 */}
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={() => navigate("/")}
                    sx={{ p: 0, mr: 2 }}
                >
                    <img
                        src="/LOGO.png"
                        alt="SeatEver Logo"
                        style={{ width: 64, height: 64 }}
                    />
                </IconButton>

                {/* ✅ 중앙 메뉴: absolute + translateX */}
                <Box
                    sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        sx={naviButtonStyle}
                        onClick={() => navigate("/cafeteria")}
                    >
                        구내식당 메뉴
                    </Button>
                    <Button
                        variant="contained"
                        sx={naviButtonStyle}
                        onClick={() => navigate("/ai")}
                    >
                        AI
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
