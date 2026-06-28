package com.dockhost.validator.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import jakarta.annotation.PostConstruct;

@Configuration
public class RabbitMQConfig {

    public static final String URL_VALIDATION_QUEUE = "url-validation";
    public static final String STATUS_UPDATE_QUEUE = "status-update";

    @Bean
    public Queue urlValidationQueue() {
        return new Queue(URL_VALIDATION_QUEUE, true);
    }

    @Bean
    public Queue statusUpdateQueue() {
        return new Queue(STATUS_UPDATE_QUEUE, true);
    }


    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        rabbitAdmin.setAutoStartup(true);
        return rabbitAdmin;
    }

    @Bean
    public RabbitTemplate jsonRabbitTemplate(ConnectionFactory connectionFactory) {

        RabbitTemplate template = new RabbitTemplate(connectionFactory);

        template.setMessageConverter(
                new Jackson2JsonMessageConverter()
        );

        return template;
    }

    @Bean
    public ApplicationRunner declareQueues(RabbitAdmin rabbitAdmin) {
        return args -> {
            rabbitAdmin.initialize();
            System.out.println("RabbitMQ queues declared!");
        };
    }
}