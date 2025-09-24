// 화면 최상단 네비게이션 바
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    IconButton, // IconButton은 그대로 유지하지만, 내부 아이콘은 이미지로 변경
} from '@mui/material';
import { useNavigate } from "react-router-dom";


export default function Navigation(){
    const navigate = useNavigate();

    const naviButtonStyle= {
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
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* 상단 로고 아이콘 부분을 이미지로 변경 */}
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 1 }}
                        onClick={() => navigate("/")}
                    >
                        <img
                            src="/LOGO.png" // public 폴더의 LOGO.png 경로
                            alt="SeatEver Logo"
                            style={{ width: 64, height: 64 }} // 적절한 크기로 조정
                        />
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
                        onClick={() => navigate("/grafana")}
                    >
                        게시판
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