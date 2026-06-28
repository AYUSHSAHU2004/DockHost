package com.dockhost.validator.service;

import com.dockhost.validator.model.UrlRequest;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.concurrent.Future;
import java.util.concurrent.Callable;
import java.time.Duration;
import java.net.URI;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import com.dockhost.validator.model.UrlResponse;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class ValidatorService {

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();



    public UrlResponse  validate(String url) {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            return new UrlResponse(
                    url,
                    response.statusCode(),
                    response.statusCode() >= 200 && response.statusCode() < 400,
                    "SUCCESS"
            );
        } catch (java.net.http.HttpTimeoutException e) {

            return new UrlResponse(
                    url,
                    0,
                    false,
                    "TIMEOUT"
            );

        } catch (java.net.UnknownHostException e) {

            return new UrlResponse(
                    url,
                    0,
                    false,
                    "UNKNOWN_HOST"
            );

        } catch (javax.net.ssl.SSLException e) {

            return new UrlResponse(
                    url,
                    0,
                    false,
                    "SSL_ERROR"
            );

        } catch (IOException e) {

            return new UrlResponse(
                    url,
                    0,
                    false,
                    "IO_ERROR"
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            return new UrlResponse(
                    url,
                    0,
                    false,
                    "INTERRUPTED"
            );
        }
    }

}