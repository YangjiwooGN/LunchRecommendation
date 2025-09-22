package com.autoever.lunch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CafeteriaDto {
    private String name;     // 식당 이름 (게시글 제목 등)
    private String address;  // 주소 텍스트(추정)
    private String price;    // 가격 텍스트(추정)
    private String imageUrl; // 대표 이미지 URL
    private String postUrl;  // 원문 링크
}
