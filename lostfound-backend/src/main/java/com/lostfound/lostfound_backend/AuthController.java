package com.lostfound.lostfound_backend;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public record RegisterRequest(@NotBlank String name,
                                  @Email @NotBlank String email,
                                  @Size(min = 6) String password) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, String name, String email, String role) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }
        AppUser u = new AppUser();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
        return ResponseEntity.ok(new AuthResponse(jwt.generateToken(u), u.getName(), u.getEmail(), u.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var found = users.findByEmail(req.email().trim().toLowerCase());
        if (found.isEmpty() || !encoder.matches(req.password(), found.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        AppUser u = found.get();
        return ResponseEntity.ok(new AuthResponse(jwt.generateToken(u), u.getName(), u.getEmail(), u.getRole()));
    }
}