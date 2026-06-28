package com.dockhost.validator;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class ValidatorServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ValidatorServiceApplication.class, args);
	}

}
