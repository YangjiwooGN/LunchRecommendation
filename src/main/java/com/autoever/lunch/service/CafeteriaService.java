package com.autoever.lunch.service;

import com.autoever.lunch.dto.CafeteriaDto;
import io.github.bonigarcia.wdm.WebDriverManager;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class CafeteriaService {

    private static final String BLOG_LIST_URL =
            "https://m.blog.naver.com/PostList.naver?blogId=namsa87&categoryNo=0&listStyle=post&tab=1";

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter KST_KOR_DATE =
            DateTimeFormatter.ofPattern("M월 d일", Locale.KOREAN); // 예: "9월 24일"

    private final List<CafeteriaDto> cached = new CopyOnWriteArrayList<>();
    private LocalDate cachedDate = null;

    // ===================== 공개 API =====================

    /** 오늘 메뉴 반환 (캐시 없으면 즉시 크롤링) */
    public List<CafeteriaDto> getTodayMenus() {
        LocalDate today = LocalDate.now(KST);

        if (cachedDate != null && cachedDate.equals(today) && !cached.isEmpty()) {
            log.info("✅ 캐시 사용 ({}건, date={})", cached.size(), cachedDate);
            return Collections.unmodifiableList(cached);
        }

        log.info("⚠️ 캐시 없음 → 즉시 크롤링 시도");
        List<CafeteriaDto> latest = doCrawl();
        if (!latest.isEmpty()) {
            cached.clear();
            cached.addAll(latest);
            cachedDate = today;
            log.info("✅ 새 크롤링 성공 ({}건)", latest.size());
        } else {
            log.warn("❌ 크롤링 실패 → 빈 배열 반환");
        }

        return Collections.unmodifiableList(cached);
    }

    /** 매일 11시에 크롤링해서 캐시 저장 */
    @Scheduled(cron = "0 0 11 * * *", zone = "Asia/Seoul")
    public void scheduledCrawl() {
        log.info("⏰ 11시 자동 크롤링 시작");
        List<CafeteriaDto> latest = doCrawl();
        if (!latest.isEmpty()) {
            cached.clear();
            cached.addAll(latest);
            cachedDate = LocalDate.now(KST);
            log.info("✅ 캐시 저장 완료: {}건 (date={})", latest.size(), cachedDate);
        } else {
            log.warn("⚠️ 크롤링 결과 0건 (캐시 미갱신)");
        }
    }

    public List<CafeteriaDto> forceCrawlNowForDebug() {
        return doCrawl();
    }

    // ===================== 내부 로직 =====================

    private List<CafeteriaDto> doCrawl() {
        String todayKor = LocalDate.now(KST).format(KST_KOR_DATE);
        log.info("📅 오늘 날짜 키워드 = {}", todayKor);

        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        WebDriver driver = new ChromeDriver(options);

        try {
            driver.get(BLOG_LIST_URL);
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(12));
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("ul.list__Q47r_ li.item__PxpH8")));

            String targetUrl = findTodayPostUrl(driver, todayKor);
            if (targetUrl == null) {
                log.warn("⚠️ 오늘자 '가디 구내식당 메뉴' 글을 찾지 못함");
                return Collections.emptyList();
            }
            log.info("🔗 대상 글 URL: {}", targetUrl);

            List<CafeteriaDto> items = parseCafeteriasFromPost(driver, targetUrl);
            log.info("📦 추출 완료: {}건", items.size());
            return items;

        } catch (TimeoutException te) {
            log.warn("⏳ 목록 대기 타임아웃: {}", te.getMessage());
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("❌ 크롤링 중 예외", e);
            return Collections.emptyList();
        } finally {
            try { driver.quit(); } catch (Exception ignore) {}
        }
    }

    private String findTodayPostUrl(WebDriver driver, String todayKor) {
        List<WebElement> posts = driver.findElements(
                By.cssSelector("ul.list__Q47r_ li.item__PxpH8 a.link__A4O1D"));

        List<String> urls = new ArrayList<>();
        List<String> titles = new ArrayList<>();

        for (WebElement a : posts) {
            try {
                String href = a.getAttribute("href");
                String title;
                try {
                    WebElement strong = a.findElement(By.cssSelector("strong.title__Hj5DO"));
                    title = strong.getText();
                } catch (NoSuchElementException ignore) {
                    title = a.getText();
                }
                if (href != null && !href.isBlank()) {
                    urls.add(href);
                    titles.add(title == null ? "" : title.trim());
                }
            } catch (StaleElementReferenceException ignore) {}
        }

        if (urls.isEmpty()) {
            List<WebElement> anchors = driver.findElements(By.cssSelector("a[href*='/namsa87/']"));
            for (WebElement a : anchors) {
                try {
                    String href = a.getAttribute("href");
                    String title = a.getText();
                    if (href != null && href.contains("/namsa87/")) {
                        urls.add(href);
                        titles.add(title == null ? "" : title.trim());
                    }
                } catch (Exception ignore) {}
            }
        }

        log.info("🧭 후보 글 수집: {}건", urls.size());

        for (int i = 0; i < urls.size(); i++) {
            String title = titles.get(i);
            log.debug("  - 후보: {}", title);
            if (title.contains("가디 구내식당 메뉴") && title.contains(todayKor)) {
                return urls.get(i);
            }
        }
        return null;
    }

    private List<CafeteriaDto> parseCafeteriasFromPost(WebDriver driver, String targetUrl) {
        List<CafeteriaDto> out = new ArrayList<>();

        driver.navigate().to(targetUrl);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(12));
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector(".se-viewer, .se_component_wrap")));
        } catch (TimeoutException te) {
            log.warn("⏳ 본문 로드 타임아웃: {}", te.getMessage());
        }

        List<WebElement> blocks = driver.findElements(By.cssSelector(
                "div.se-viewer .se-component, div.se_component_wrap .se-component, .se-component"));

        log.info("🧩 본문 블록 수: {}", blocks.size());

        CafeteriaDto lastDto = null;

        for (int i = 0; i < blocks.size(); i++) {
            String text = safeText(blocks.get(i)).trim();

            // ✅ 바뀐 부분: 이미지 추출 로직 개선
            String firstImg = findNearbyImage(blocks, i);

            log.debug("블록[{}] => {} {}", i, text.replace("\n", " / "),
                    firstImg != null ? "[img]" : "");

            if (isRestaurantBlock(text)) {
                CafeteriaDto dto = parseRestaurantLine(text, firstImg, targetUrl);
                out.add(dto);
                lastDto = dto;
                log.info("✅ 메뉴 등록: {} | img={}", dto.getName(), firstImg);
                continue;
            }

            if (text.startsWith("서울특별시") || text.startsWith("경기도") || text.contains("로 ")) {
                if (lastDto != null && (lastDto.getAddress() == null || lastDto.getAddress().isBlank())) {
                    String cleanedAddr = cleanAddress(text);
                    lastDto.setAddress(cleanedAddr);
                    log.info("📍 주소 매핑: {} -> {}", lastDto.getName(), cleanedAddr);
                }
            }
        }

        return out;
    }

    private String findNearbyImage(List<WebElement> blocks, int index) {
        // 현재 블록
        String img = extractImage(blocks.get(index));
        if (img != null) return img;

        // ✅ 다음 블록 먼저 검사 (메뉴 사진이 뒤에 오는 경우가 많음)
        if (index + 1 < blocks.size()) {
            img = extractImage(blocks.get(index + 1));
            if (img != null) return img;
        }

        // 이전 블록
        if (index > 0) {
            img = extractImage(blocks.get(index - 1));
            if (img != null) return img;
        }

        return null;
    }


    private String extractImage(WebElement block) {
        try {
            for (WebElement img : block.findElements(By.cssSelector("img"))) {
                // 원본 이미지 속성 우선 확인
                String url = img.getAttribute("data-src");
                if (url == null || url.isBlank()) {
                    url = img.getAttribute("data-lazy-src");
                }
                if (url == null || url.isBlank()) {
                    url = img.getAttribute("data-original");
                }
                // 마지막 fallback → src
                if (url == null || url.isBlank()) {
                    url = img.getAttribute("src");
                }

                if (url != null && !url.isBlank() && !url.contains("map.pstatic.net")) {
                    return url;
                }
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private String cleanAddress(String raw) {
        if (raw == null) return "";
        String cleaned = raw
                .replaceAll("50m", "")
                .replaceAll("© NAVER Corp.", "")
                .replaceAll("이 블로그의 체크인", "")
                .replaceAll("이 장소의 다른 글", "")
                .trim();

        for (String line : cleaned.split("\n")) {
            if (line.startsWith("서울특별시") || line.startsWith("경기도")) {
                return line.trim();
            }
        }
        return cleaned;
    }

    private boolean isRestaurantBlock(String text) {
        if (text == null) return false;
        return text.contains("구내식당") && text.contains("식대");
    }

    private CafeteriaDto parseRestaurantLine(String line, String imageUrl, String postUrl) {
        String namePart = line.split("식대")[0].trim();

        String pricePart = "";
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("식대\\s*[:：]?\\s*([0-9,]+원)")
                .matcher(line);
        if (m.find()) {
            pricePart = m.group(1);
        }

        String hours = "";
        m = java.util.regex.Pattern
                .compile("영업시간\\s*[:：]?\\s*([0-9시~: ]+)")
                .matcher(line);
        if (m.find()) {
            hours = m.group(1);
        }

        return new CafeteriaDto(
                namePart,
                "",
                pricePart + (hours.isEmpty() ? "" : " / " + hours),
                imageUrl == null ? "" : imageUrl,
                postUrl
        );
    }

    private String safeText(WebElement el) {
        try {
            return el.getText();
        } catch (StaleElementReferenceException e) {
            return "";
        }
    }
}
