package com.dockhost.validator.cache;

import com.dockhost.validator.model.UrlInfo;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UrlCache {

    private final ConcurrentHashMap<String, UrlInfo> cache =
            new ConcurrentHashMap<>();

    public void addOrUpdate(UrlInfo urlInfo) {
        cache.put(urlInfo.getUrl(), urlInfo);
    }

    public void remove(String url) {
        cache.remove(url);
    }

    public Collection<UrlInfo> getAll() {
        return cache.values();
    }

    public UrlInfo get(String url) {
        return cache.get(url);
    }
}