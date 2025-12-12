package com.example.springboot2project.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 日期工具类
 */
public class DateUtils {

    private static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_FORMAT);

    private DateUtils() {
        throw new IllegalStateException("DateUtils class");
    }

    /**
     * 格式化日期
     */
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(FORMATTER);
    }

    /**
     * 获取当前时间字符串
     */
    public static String now() {
        return format(LocalDateTime.now());
    }
}
