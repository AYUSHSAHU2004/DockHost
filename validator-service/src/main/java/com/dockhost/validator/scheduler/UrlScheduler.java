package com.dockhost.validator.scheduler;

import com.dockhost.validator.cache.UrlCache;
import com.dockhost.validator.model.UrlInfo;
import com.dockhost.validator.model.UrlResponse;
import com.dockhost.validator.producer.StatusProducer;
import com.dockhost.validator.service.ValidatorService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


@Component
public class UrlScheduler {

    private final UrlCache urlCache;
    private final ValidatorService validatorService;
    private final StatusProducer statusProducer;
    private final ExecutorService executor =
            Executors.newFixedThreadPool(10);


    public UrlScheduler(UrlCache urlCache,
                        ValidatorService validatorService,
                        StatusProducer statusProducer) {

        this.urlCache = urlCache;
        this.validatorService = validatorService;
        this.statusProducer = statusProducer;
    }
    @Scheduled(fixedRate = 10000)
    public void validateAllUrls() {

        System.out.println("Scheduler Running...");

        List<Future<?>> futures = new ArrayList<>();

        for (UrlInfo urlInfo : urlCache.getAll()) {

            Future<?> future = executor.submit(() -> {

                UrlResponse response = validatorService.validate(urlInfo.getUrl());

                if (!java.util.Objects.equals(urlInfo.getMessage(), response.getMessage())) {

                    urlInfo.setAlive(response.isAlive());
                    urlInfo.setStatusCode(response.getStatusCode());
                    urlInfo.setMessage(response.getMessage());

                    urlCache.addOrUpdate(urlInfo);

                    statusProducer.send(response);
                    System.out.println("Status Changed -> " + response.getUrl());
                }

            });

            futures.add(future);
        }

        for (Future<?> future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

}