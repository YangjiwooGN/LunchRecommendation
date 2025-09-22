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

    // ✅ 캐시된 최신 결과 조회 (매일 11시에 자동 갱신됨)
    @GetMapping
    public ResponseEntity<List<CafeteriaDto>> list() {
        return ResponseEntity.ok(service.getCached());
    }

    // ✅ 수동으로 즉시 크롤링 실행 (개발/디버그용)
    @PostMapping("/crawl")
    public ResponseEntity<List<CafeteriaDto>> crawlNow() {
        List<CafeteriaDto> latest = service.crawlTodayPosts();
        return ResponseEntity.ok(latest);
    }
}
