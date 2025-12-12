package com.example.springboot2project.pojo.response;

import com.example.springboot2project.vo.UserVO;

import java.util.List;

/**
 * 用户分页响应对象
 */
public class UserPageResponse {

    private Long current;
    private Long size;
    private Long total;
    private Long pages;
    private List<UserVO> records;

    // Getters and Setters
    public Long getCurrent() {
        return current;
    }

    public void setCurrent(Long current) {
        this.current = current;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public Long getPages() {
        return pages;
    }

    public void setPages(Long pages) {
        this.pages = pages;
    }

    public List<UserVO> getRecords() {
        return records;
    }

    public void setRecords(List<UserVO> records) {
        this.records = records;
    }
}
