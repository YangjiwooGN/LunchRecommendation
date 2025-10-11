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
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CasinoIcon from "@mui/icons-material/Casino";
import TimelineIcon from "@mui/icons-material/Timeline";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
        { label: "구내식당 메뉴", path: "/cafeteria", icon: <RestaurantIcon /> },
        { label: "룰렛 돌리기", path: "/roulette", icon: <CasinoIcon /> },
        { label: "사다리 타기", path: "/ladder", icon: <TimelineIcon /> },
    ];

    return (
        <AppBar position="fixed" elevation={1} sx={{ backgroundColor: "white", color: "black" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* 로고 */}
                <IconButton onClick={() => navigate("/")} sx={{ p: 0 }}>
                    <img
                        src="/navigation_logo.png"
                        alt="로고"
                        style={{ width: 130, height: 85 }}
                    />
                </IconButton>

                {/* 데스크탑 메뉴 */}
                {!isMobile && (
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

                {/* 모바일 Drawer */}
                {isMobile && (
                    <>
                        <IconButton onClick={() => setOpenDrawer(true)}>
                            <MenuIcon fontSize="large" />
                        </IconButton>

                        <Drawer
                            anchor="right"
                            open={openDrawer}
                            onClose={() => setOpenDrawer(false)}
                            PaperProps={{
                                sx: { width: 260, backgroundColor: "#fafafa" },
                            }}
                        >
                            {/* Drawer 상단 헤더 */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    p: 2,
                                    borderBottom: "1px solid #ddd",
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    메뉴
                                </Typography>
                                <IconButton onClick={() => setOpenDrawer(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* 메뉴 리스트 */}
                            <List>
                                {menuItems.map((item, index) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <React.Fragment key={item.path}>
                                            <ListItemButton
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setOpenDrawer(false);
                                                }}
                                                sx={{
                                                    py: 1.5,
                                                    backgroundColor: isActive
                                                        ? "#e0e0e0"
                                                        : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: "#d6d6d6",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: "#555" }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: isActive ? "bold" : "medium",
                                                        fontSize: "1rem",
                                                    }}
                                                />
                                            </ListItemButton>
                                            {index < menuItems.length - 1 && <Divider />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
