package com.malangee.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 테스트용 모든 출처 허용
public class HealthController {

    @GetMapping("/health")
    public String healthCheck() {
        return "Backend 정상 작동 중 (Spring Boot)";
    }
}
