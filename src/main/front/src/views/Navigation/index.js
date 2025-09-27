// Navigation.js
import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export default function Navigation() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md")); // ✅ 화면이 md(960px) 이하일 때 true

    const [openDrawer, setOpenDrawer] = useState(false);

    const naviButtonStyle = {
        bgcolor: "#fff",
        color: "black",
        fontWeight: "bold",
        boxShadow: "none",
        "&:hover": { bgcolor: "#eeeeee" },
        textTransform: "none",
    };

    const menuItems = [
        { label: "구내식당 메뉴", path: "/cafeteria" },
        { label: "룰렛 돌리기", path: "/roulette" },
        { label: "사다리 타기", path: "/ladder" },
    ];

    return (
        <AppBar position="fixed" elevation={1} sx={{ backgroundColor: "white", color: "black" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* 왼쪽 로고 */}
                <IconButton onClick={() => navigate("/")} sx={{ p: 0 }}>
                    <img src="/navigation_logo.png" alt="뭐먹지 로고" style={{ width: 100, height: 70 }} />
                </IconButton>

                {/* 데스크탑 메뉴 */}
                {!isMobile && (
                    <Box sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                    }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.path}
                                variant="contained"
                                sx={naviButtonStyle}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                )}

                {/* 모바일 메뉴: 햄버거 아이콘 */}
                {isMobile && (
                    <>
                        <IconButton onClick={() => setOpenDrawer(true)}>
                            <MenuIcon fontSize="large" />
                        </IconButton>

                        <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
                            <List sx={{ width: 220 }}>
                                {menuItems.map((item) => (
                                    <ListItem
                                        button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setOpenDrawer(false);
                                        }}
                                    >
                                        <ListItemText primary={item.label} />
                                    </ListItem>
                                ))}
                            </List>
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
