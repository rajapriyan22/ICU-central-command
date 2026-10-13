package com.icucentralcommand.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String HMAC_ALGO = "HmacSHA256";

    private final byte[] secretBytes;
    private final long expiryMinutes;
    private final ObjectMapper objectMapper;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiry-minutes:480}") long expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
        this.objectMapper = new ObjectMapper();

        if (secret == null || secret.isBlank()) {
            this.secretBytes = new byte[48];
            new SecureRandom().nextBytes(this.secretBytes);
            log.warn("app.jwt.secret is blank. Generated random ephemeral secret; users must log in again after a restart.");
        } else if (secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        } else {
            this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
    }

    private byte[] computeSignature(byte[] data) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGO);
        mac.init(new SecretKeySpec(this.secretBytes, HMAC_ALGO));
        return mac.doFinal(data);
    }

    public String generateToken(Long userId, String username, String role) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + (expiryMinutes * 60);

            Map<String, Object> headerMap = new LinkedHashMap<>();
            headerMap.put("alg", "HS256");
            headerMap.put("typ", "JWT");

            Map<String, Object> payloadMap = new LinkedHashMap<>();
            payloadMap.put("sub", username);
            payloadMap.put("uid", userId);
            payloadMap.put("role", role);
            payloadMap.put("iat", now);
            payloadMap.put("exp", exp);

            String headerJson = objectMapper.writeValueAsString(headerMap);
            String payloadJson = objectMapper.writeValueAsString(payloadMap);

            Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
            String headerPart = encoder.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String payloadPart = encoder.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            String content = headerPart + "." + payloadPart;
            byte[] signatureBytes = computeSignature(content.getBytes(StandardCharsets.US_ASCII));
            String signaturePart = encoder.encodeToString(signatureBytes);

            return content + "." + signaturePart;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT", e);
        }
    }

    public Optional<JwtPrincipal> parse(String token) {
        if (token == null) {
            return Optional.empty();
        }

        // 1. exactly 3 dot-separated parts
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3) {
            return Optional.empty();
        }

        try {
            // 2. verify signature FIRST using constant-time comparison (MessageDigest.isEqual)
            byte[] expectedSig = computeSignature((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));
            byte[] actualSig = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                return Optional.empty();
            }

            // 3. header alg must equal "HS256" (never trust any other alg, so "none" is rejected)
            byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
            JsonNode headerNode = objectMapper.readTree(headerBytes);
            if (!headerNode.hasNonNull("alg") || !"HS256".equals(headerNode.get("alg").asText())) {
                return Optional.empty();
            }

            // 4. exp must be a number in the future
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payloadBytes);
            if (!payloadNode.hasNonNull("exp") || !payloadNode.get("exp").isNumber()) {
                return Optional.empty();
            }
            long exp = payloadNode.get("exp").asLong();
            if (exp <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }

            // 5. sub and role must be non-blank strings
            if (!payloadNode.hasNonNull("sub") || !payloadNode.get("sub").isTextual() || payloadNode.get("sub").asText().isBlank()) {
                return Optional.empty();
            }
            if (!payloadNode.hasNonNull("role") || !payloadNode.get("role").isTextual() || payloadNode.get("role").asText().isBlank()) {
                return Optional.empty();
            }

            Long uid = null;
            if (payloadNode.hasNonNull("uid") && payloadNode.get("uid").isNumber()) {
                uid = payloadNode.get("uid").asLong();
            }

            String username = payloadNode.get("sub").asText().trim();
            // 6. role is upper-cased
            String role = payloadNode.get("role").asText().trim().toUpperCase();

            return Optional.of(new JwtPrincipal(uid, username, role));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public record JwtPrincipal(Long userId, String username, String role) {}
}
