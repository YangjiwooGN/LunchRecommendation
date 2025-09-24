package com.autoever.lunch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // ✅ 스케줄링 활성화
public class LunchApplication {
	public static void main(String[] args) {
		SpringApplication.run(LunchApplication.class, args);
	}
}
