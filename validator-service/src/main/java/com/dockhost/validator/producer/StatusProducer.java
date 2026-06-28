package com.dockhost.validator.producer;

import com.dockhost.validator.config.RabbitMQConfig;
import com.dockhost.validator.model.UrlResponse;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class StatusProducer {

    private final RabbitTemplate jsonRabbitTemplate;

    public StatusProducer(
            @Qualifier("jsonRabbitTemplate")
            RabbitTemplate jsonRabbitTemplate
    ) {
        this.jsonRabbitTemplate = jsonRabbitTemplate;
    }

    public void send(UrlResponse response) {

        jsonRabbitTemplate.convertAndSend(
                RabbitMQConfig.STATUS_UPDATE_QUEUE,
                response
        );
    }
}