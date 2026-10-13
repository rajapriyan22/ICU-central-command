package com.icucentralcommand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IcuCentralCommandApplication {

    public static void main(String[] args) {
        SpringApplication.run(IcuCentralCommandApplication.class, args);
    }
}
