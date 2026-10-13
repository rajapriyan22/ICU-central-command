package com.icucentralcommand.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class BedOccupiedException extends RuntimeException {
    public BedOccupiedException(String message) {
        super(message);
    }
}
