package com.dockhost.validator.consumer;

import com.dockhost.validator.cache.UrlCache;
import com.dockhost.validator.config.RabbitMQConfig;
import com.dockhost.validator.model.UrlInfo;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UrlValidationConsumer {
    private final UrlCache urlCache;

    @RabbitListener(queues = RabbitMQConfig.URL_VALIDATION_QUEUE)
    public void receive(String message) {

        UrlInfo urlInfo = new UrlInfo(
                message,
                false,
                0,
                "UNKNOWN"
        );


        urlCache.addOrUpdate(urlInfo);

        System.out.println("Added to cache: " + message);
    }
    public UrlValidationConsumer(UrlCache urlCache) {
        this.urlCache = urlCache;
    }
}