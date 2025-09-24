import React from "react";
import {Route, Routes} from "react-router-dom";
import ProjectMain from "./views/MainPage";
import CafeteriaList from "./views/CafeteriaList";

export default function Routing(){
    return (
        <div>
            <div style={{ marginTop: '100px' }}>
                <Routes>
                    <Route path='/' element={<ProjectMain/>} />
                    <Route path='/cafeteria' element={<CafeteriaList/>} />
                </Routes>
            </div>
        </div>
    )
}