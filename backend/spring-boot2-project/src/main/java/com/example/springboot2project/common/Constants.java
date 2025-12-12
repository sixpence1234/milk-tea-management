package com.example.springboot2project.common;

/**
 * 系统常量类
 */
public class Constants {

    private Constants() {
        throw new IllegalStateException("Constants class");
    }

    /** 成功状态码 */
    public static final int SUCCESS_CODE = 200;

    /** 失败状态码 */
    public static final int ERROR_CODE = 500;

    /** 未授权状态码 */
    public static final int UNAUTHORIZED_CODE = 401;

    /** 禁止访问状态码 */
    public static final int FORBIDDEN_CODE = 403;

    /** 资源未找到状态码 */
    public static final int NOT_FOUND_CODE = 404;

    /** 参数错误状态码 */
    public static final int BAD_REQUEST_CODE = 400;

    /** 成功消息 */
    public static final String SUCCESS_MESSAGE = "操作成功";

    /** 失败消息 */
    public static final String ERROR_MESSAGE = "操作失败";

    /** 默认分页大小 */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /** 最大分页大小 */
    public static final int MAX_PAGE_SIZE = 100;
}
