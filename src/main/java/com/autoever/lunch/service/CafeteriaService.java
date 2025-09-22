package com.autoever.lunch.service;

import com.autoever.lunch.dto.CafeteriaDto;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class CafeteriaService {

    // 최신 데이터 보관 (동시성 안전)
    private final List<CafeteriaDto> cached = new CopyOnWriteArrayList<>();

    private static final String BLOG_LIST_URL =
            "https://m.blog.naver.com/PostList.naver?blogId=namsa87&categoryNo=0&listStyle=post&tab=1";

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter KST_DOT_DATE = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    // ✅ 매일 오전 11시(한국시간) 자동 크롤링
    @Scheduled(cron = "0 0 11 * * *", zone = "Asia/Seoul")
    public void scheduledCrawl() {
        List<CafeteriaDto> latest = crawlTodayPosts();
        if (!latest.isEmpty()) {
            cached.clear();
            cached.addAll(latest);
        }
    }

    // 수동 트리거(Controller에서 호출)
    public List<CafeteriaDto> crawlTodayPosts() {
        WebDriverManager.chromedriver().setup(); // 자동 드라이버 관리

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1200,2000");
        // Naver 차단 회피용 UA (너무 빈약한 기본 헤더 방지)
        options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        WebDriver driver = new ChromeDriver(options);

        String today = LocalDate.now(KST).format(KST_DOT_DATE);
        List<CafeteriaDto> result = new ArrayList<>();

        try {
            driver.get(BLOG_LIST_URL);

            // 목록에서 글 링크 수집 (모바일 블로그 구조 변경 대비: href에 /namsa87/ 포함 링크 위주)
            List<WebElement> anchors = driver.findElements(By.cssSelector("a[href*='/namsa87/']"));
            // 중복 제거 + 상위 N개만 시도
            LinkedHashSet<String> postUrls = new LinkedHashSet<>();
            for (WebElement a : anchors) {
                String href = a.getAttribute("href");
                if (href != null && href.contains("/namsa87/")) {
                    postUrls.add(href);
                    if (postUrls.size() >= 10) break; // 과도한 접근 방지
                }
            }

            for (String postUrl : postUrls) {
                try {
                    driver.navigate().to(postUrl);

                    // 페이지에 오늘 날짜(yyyy.MM.dd) 포함된 글만 대상
                    if (!driver.getPageSource().contains(today)) {
                        continue;
                    }

                    // 대표 이미지가 없는 글은 스킵
                    List<WebElement> images = driver.findElements(By.cssSelector("img[src^='http']"));
                    if (images.isEmpty()) continue;
                    String imageUrl = images.get(0).getAttribute("src");
                    if (imageUrl == null || imageUrl.isBlank()) continue;

                    // 제목(식당명 근사): og:title 사용
                    String title = getMetaContent(driver, "meta[property='og:title']");
                    if (title == null || title.isBlank()) {
                        // fallback: 문서 title
                        title = driver.getTitle();
                    }

                    // 가격/주소 근사치 추출 (키워드 탐색)
                    String price = firstTextContaining(driver, "원");         // 예: "9,000원" 등
                    String address = firstTextContainingAny(driver, List.of("주소", "위치", "도로명", "지번"));

                    // 최소 요건: 이미지 존재
                    result.add(new CafeteriaDto(
                            safeTrim(title),
                            safeTrim(address),
                            safeTrim(price),
                            imageUrl,
                            postUrl
                    ));
                } catch (Exception ignoreSingle) {
                    // 개별 글 파싱 실패는 무시하고 계속
                }
            }
        } finally {
            driver.quit();
        }
        return result;
    }

    public List<CafeteriaDto> getCached() {
        return Collections.unmodifiableList(cached);
    }

    // ===== Helper Methods =====

    private static String getMetaContent(WebDriver driver, String css) {
        try {
            WebElement el = driver.findElement(By.cssSelector(css));
            return el.getAttribute("content");
        } catch (NoSuchElementException e) {
            return null;
        }
    }

    private static String firstTextContaining(WebDriver driver, String keyword) {
        try {
            List<WebElement> els = driver.findElements(By.xpath("//*[contains(text(),'" + keyword + "')]"));
            for (WebElement el : els) {
                String t = safeTrim(el.getText());
                if (!t.isBlank()) return t;
            }
        } catch (Exception ignored) {}
        return "";
    }

    private static String firstTextContainingAny(WebDriver driver, List<String> keywords) {
        for (String k : keywords) {
            String t = firstTextContaining(driver, k);
            if (!t.isBlank()) return t;
        }
        return "";
    }

    private static String safeTrim(String s) {
        return s == null ? "" : s.trim();
    }
}
