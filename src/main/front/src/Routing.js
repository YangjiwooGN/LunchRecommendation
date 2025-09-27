import React from "react";
import {Route, Routes} from "react-router-dom";
import ProjectMain from "./views/MainPage";
import CafeteriaList from "./views/CafeteriaList";
import Roulette from "./views/Roulette";
import Ladder from "./views/Ladder";

export default function Routing(){
    return (
        <div>
            <div style={{ marginTop: '85px' }}>
                <Routes>
                    <Route path='/' element={<ProjectMain/>} />
                    <Route path='/cafeteria' element={<CafeteriaList/>} />
                    <Route path='/roulette' element={<Roulette/>} />
                    <Route path='/ladder' element={<Ladder/>} />
                </Routes>
            </div>
        </div>
    )
}