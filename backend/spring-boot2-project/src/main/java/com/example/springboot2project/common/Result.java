package com.example.springboot2project.common;

/**
 * 统一返回结果封装
 */
public class Result<T> {

    private int code;
    private String message;
    private T data;

    public Result() {
    }

    public Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> success() {
        return new Result<>(Constants.SUCCESS_CODE, Constants.SUCCESS_MESSAGE, null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(Constants.SUCCESS_CODE, Constants.SUCCESS_MESSAGE, data);
    }

    public static <T> Result<T> success(String message) {
        return new Result<>(Constants.SUCCESS_CODE, message, null);
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(Constants.SUCCESS_CODE, message, data);
    }

    public static <T> Result<T> error() {
        return new Result<>(Constants.ERROR_CODE, Constants.ERROR_MESSAGE, null);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(Constants.ERROR_CODE, message, null);
    }

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // Getters and Setters
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
