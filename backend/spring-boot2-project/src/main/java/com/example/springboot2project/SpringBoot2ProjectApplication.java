package com.example.springboot2project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 2.7.18 Application
 *
 * Clean and simple starter project with:
 * - Spring Boot 2.7.18
 * - MyBatis Plus 3.5.3.1
 * - MySQL 5.7
 *
 * Default port: 8080
 */
@SpringBootApplication
public class SpringBoot2ProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBoot2ProjectApplication.class, args);
        System.out.println("  #####   ##   ##    ####     ####   #######   #####    #####\n" +
                " ##   ##  ##   ##   ##  ##   ##  ##   ##   #  ##   ##  ##   ##\n" +
                " #        ##   ##  ##       ##        ## #    #        #\n" +
                "  #####   ##   ##  ##       ##        ####     #####    #####\n" +
                "      ##  ##   ##  ##       ##        ## #         ##       ##\n" +
                " ##   ##  ##   ##   ##  ##   ##  ##   ##   #  ##   ##  ##   ##\n" +
                "  #####    #####     ####     ####   #######   #####    #####\n" +
                " 2.7.18\n");


    }

}
