package com.dockhost.validator.model;

public class UrlInfo {

    private String url;

    private boolean alive;
    private String message;
    private int statusCode;

    public UrlInfo() {
    }
    public String getMessage(){
        return this.message;
    }
    public int getStatusCode(){
        return this.statusCode;
    }
    public void setStatusCode(int sc){
        this.statusCode = sc;
    }
    public void setMessage(String message){
        this.message = message;
    }
    public UrlInfo(String url, boolean alive, int statusCode, String message) {
        this.url = url;
        this.alive = alive;
        this.statusCode = statusCode;
        this.message = message;
    }

    public UrlInfo(String url, boolean alive) {
        this.url = url;
        this.alive = alive;
    }

    public String getUrl() {
        return url;
    }


    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isAlive() {
        return alive;
    }

    public void setAlive(boolean alive) {
        this.alive = alive;
    }
}