package com.autoever.lunch.service;

import com.autoever.lunch.dto.CafeteriaDto;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class CafeteriaService {

    private List<CafeteriaDto> cached = new CopyOnWriteArrayList<>();
    private LocalDate cachedDate; // 기준 날짜 저장 (ex: 2025-09-23)

    private static final String BLOG_LIST_URL =
            "https://m.blog.naver.com/PostList.naver?blogId=namsa87&categoryNo=0&listStyle=post&tab=1";

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter KST_DOT_DATE = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    /**
     * 외부에서 호출할 때마다 "현재 시각이 오늘 11시~내일 10:59 구간인지" 계산해서
     * 캐시된 글이 맞으면 캐시 반환, 아니면 새로 크롤링
     */
    public List<CafeteriaDto> getTodayMenus() {
        if (isCacheValid()) {
            return Collections.unmodifiableList(cached);
        } else {
            List<CafeteriaDto> latest = crawlTodayPosts();
            if (!latest.isEmpty()) {
                cached.clear();
                cached.addAll(latest);
                cachedDate = LocalDate.now(KST); // 기준 날짜 저장
            }
            return Collections.unmodifiableList(cached);
        }
    }

    /**
     * 캐시가 유효한지 확인: 현재 시간이 오늘 11:00 ~ 내일 10:59 사이 && cachedDate가 오늘인 경우
     */
    private boolean isCacheValid() {
        if (cachedDate == null) return false;

        LocalDate nowDate = LocalDate.now(KST);
        LocalTime nowTime = LocalTime.now(KST);

        // 오늘 11:00 ~ 23:59
        LocalDateTime todayStart = LocalDateTime.of(nowDate, LocalTime.of(11, 0));
        LocalDateTime todayEnd = LocalDateTime.of(nowDate, LocalTime.MAX);

        // 내일 00:00 ~ 10:59
        LocalDateTime tomorrowEnd = LocalDateTime.of(nowDate.plusDays(1), LocalTime.of(10, 59, 59));

        LocalDateTime now = LocalDateTime.now(KST);

        boolean inRange = (now.isAfter(todayStart) && now.isBefore(tomorrowEnd));
        return inRange && cachedDate.equals(nowDate);
    }

    // === 기존 crawlTodayPosts()는 그대로 사용 ===
    public List<CafeteriaDto> crawlTodayPosts() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");

        WebDriver driver = new ChromeDriver(options);
        String today = LocalDate.now(KST).format(KST_DOT_DATE);
        List<CafeteriaDto> result = new ArrayList<>();

        try {
            driver.get(BLOG_LIST_URL);

            List<WebElement> anchors = driver.findElements(By.cssSelector("a[href*='/namsa87/']"));
            LinkedHashSet<String> postUrls = new LinkedHashSet<>();
            for (WebElement a : anchors) {
                String href = a.getAttribute("href");
                if (href != null && href.contains("/namsa87/")) {
                    postUrls.add(href);
                    if (postUrls.size() >= 10) break;
                }
            }

            for (String postUrl : postUrls) {
                driver.navigate().to(postUrl);
                if (!driver.getPageSource().contains(today)) continue;

                List<WebElement> images = driver.findElements(By.cssSelector("img[src^='http']"));
                if (images.isEmpty()) continue;

                String imageUrl = images.get(0).getAttribute("src");
                String title = driver.getTitle();
                result.add(new CafeteriaDto(title, "", "", imageUrl, postUrl));
            }
        } finally {
            driver.quit();
        }
        return result;
    }
}
