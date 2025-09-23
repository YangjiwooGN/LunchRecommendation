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
            DateTimeFormatter.ofPattern("M월 d일", Locale.KOREAN); // 예: "9월 23일"

    private final List<CafeteriaDto> cached = new CopyOnWriteArrayList<>();
    private LocalDate cachedDate = null;

    /**
     * 캐시된 메뉴 반환 (없으면 크롤링)
     */
    public List<CafeteriaDto> getTodayMenus() {
        LocalDate today = LocalDate.now(KST);

        if (cachedDate != null && cachedDate.equals(today) && !cached.isEmpty()) {
            log.info("✅ 캐시 사용 ({}건)", cached.size());
            return Collections.unmodifiableList(cached);
        }

        List<CafeteriaDto> latest = crawlTodayPosts();
        if (!latest.isEmpty()) {
            cached.clear();
            cached.addAll(latest);
            cachedDate = today;
            log.info("✅ 새 크롤링 성공 ({}건)", latest.size());
        } else {
            log.warn("⚠️ 새 크롤링 결과 없음");
        }

        return Collections.unmodifiableList(cached);
    }

    /**
     * 매일 11시에 자동 크롤링
     */
    @Scheduled(cron = "0 0 11 * * *", zone = "Asia/Seoul")
    public void scheduledCrawl() {
        log.info("⏰ 11시 자동 크롤링 시작");
        getTodayMenus();
    }

    /**
     * 오늘 날짜 글만 크롤링
     */
    public List<CafeteriaDto> crawlTodayPosts() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");

        WebDriver driver = new ChromeDriver(options);
        String todayKor = LocalDate.now(KST).format(KST_KOR_DATE); // "9월 23일"
        log.info("📅 오늘 날짜 키워드 = {}", todayKor);

        List<CafeteriaDto> result = new ArrayList<>();

        try {
            driver.get(BLOG_LIST_URL);

            // 목록 로딩 대기
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("ul.list__Q47r_ li.item__PxpH8")));

            // 글 목록 수집
            List<WebElement> posts = driver.findElements(
                    By.cssSelector("ul.list__Q47r_ li.item__PxpH8 a.link__A4O1D"));

            log.info("📌 글 목록 {}건 수집됨", posts.size());

            for (WebElement post : posts) {
                String url = post.getAttribute("href");
                String title = "";
                try {
                    title = post.findElement(By.cssSelector("strong.title__Hj5DO")).getText();
                } catch (NoSuchElementException ignored) {}

                log.info("👉 글 제목: {}", title);

                // 오늘 날짜 포함 여부 확인
                if (!title.contains(todayKor)) {
                    log.info("⏭️ 오늘 날짜 미포함 → 스킵");
                    continue;
                }

                // 오늘 날짜 글이면 상세 페이지 진입
                driver.navigate().to(url);

                String address = safeGetText(driver, By.cssSelector(".se-map-address"));
                String price = safeGetText(driver, By.xpath("//*[contains(text(),'식대')]"));

                String imageUrl = "";
                List<WebElement> images = driver.findElements(By.cssSelector("img[src^='http']"));
                if (!images.isEmpty()) {
                    imageUrl = images.get(0).getAttribute("src");
                }

                result.add(new CafeteriaDto(title, address, price, imageUrl, url));
                log.info("✅ 메뉴 등록: {}", title);

                // 목록 페이지로 돌아가기 (안 돌아가면 다음 anchor 못찾음)
                driver.navigate().back();
                wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.cssSelector("ul.list__Q47r_ li.item__PxpH8")));
            }

        } finally {
            driver.quit();
        }

        return result;
    }

    private String safeGetText(WebDriver driver, By selector) {
        try {
            return driver.findElement(selector).getText();
        } catch (NoSuchElementException e) {
            return "";
        }
    }
}
