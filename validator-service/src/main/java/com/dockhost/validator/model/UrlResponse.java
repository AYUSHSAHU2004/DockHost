package com.dockhost.validator.model;

public class UrlResponse {

    private String url;
    private int statusCode;
    private boolean alive;
    private String message;

    public UrlResponse() {
    }

    public UrlResponse(String url, int statusCode, boolean alive, String message) {
        this.url = url;
        this.statusCode = statusCode;
        this.alive = alive;
        this.message = message;
    }
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public boolean isAlive() {
        return alive;
    }

    public void setAlive(boolean alive) {
        this.alive = alive;
    }
}