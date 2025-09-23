package com.autoever.lunch.controller;

import com.autoever.lunch.dto.CafeteriaDto;
import com.autoever.lunch.service.CafeteriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafeterias")
public class CafeteriaController {

    private final CafeteriaService service;

    public CafeteriaController(CafeteriaService service) {
        this.service = service;
    }

    // ✅ 요청 시점 기준으로 캐시 반환 (11시마다 자동 갱신)
    @GetMapping
    public ResponseEntity<List<CafeteriaDto>> list() {
        return ResponseEntity.ok(service.getTodayMenus());
    }

    // ✅ 강제로 새 크롤링 (디버그/테스트용)
    @PostMapping("/crawl")
    public ResponseEntity<List<CafeteriaDto>> crawlNow() {
        return ResponseEntity.ok(service.crawlTodayPosts());
    }
}
