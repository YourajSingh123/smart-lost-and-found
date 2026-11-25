package com.lostfound.lostfound_backend;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimRepository claims;
    private final ItemRepository items;
    private final UserRepository users;

    public record ClaimRequest(@NotNull Long itemId,
                               @NotBlank @Size(max = 1000) String message) {}

    public record ClaimView(Long id, Long itemId, String itemTitle, String itemType,
                            String claimerName, String claimerEmail,
                            String message, String status) {}

    private ClaimView view(Claim c) {
        Item item = items.findById(c.getItemId()).orElse(null);
        AppUser u = users.findById(c.getClaimerId()).orElse(null);
        return new ClaimView(
                c.getId(), c.getItemId(),
                item != null ? item.getTitle() : "(deleted)",
                item != null ? item.getType() : null,
                u != null ? u.getName() : "(unknown)",
                u != null ? u.getEmail() : null,
                c.getMessage(), c.getStatus());
    }

    @PostMapping("/claims")
    public ResponseEntity<?> create(@Valid @RequestBody ClaimRequest req, Authentication auth) {
        AppUser me = users.findByEmail(auth.getName()).orElse(null);
        if (me == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        Item item = items.findById(req.itemId()).orElse(null);
        if (item == null) {
            return ResponseEntity.status(404).body("Item not found");
        }
        if (!"OPEN".equals(item.getStatus())) {
            return ResponseEntity.status(409).body("This item is no longer open for claims");
        }
        if (me.getId().equals(item.getReporterId())) {
            return ResponseEntity.badRequest().body("You cannot claim your own report");
        }
        if (claims.existsByItemIdAndClaimerIdAndStatus(item.getId(), me.getId(), "PENDING")) {
            return ResponseEntity.status(409).body("You already have a pending claim on this item");
        }
        Claim c = new Claim();
        c.setItemId(item.getId());
        c.setClaimerId(me.getId());
        c.setMessage(req.message().trim());
        return ResponseEntity.ok(view(claims.save(c)));
    }

    @GetMapping("/claims/mine")
    public ResponseEntity<?> mine(Authentication auth) {
        AppUser me = users.findByEmail(auth.getName()).orElse(null);
        if (me == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        List<ClaimView> list = claims.findByClaimerIdOrderByIdDesc(me.getId())
                .stream().map(this::view).toList();
        return ResponseEntity.ok(list);
    }

    // ---------- Admin ----------

    @GetMapping("/admin/claims")
    public List<ClaimView> adminList(@RequestParam(defaultValue = "PENDING") String status) {
        return claims.findByStatusOrderByIdDesc(status.toUpperCase())
                .stream().map(this::view).toList();
    }

    @PatchMapping("/admin/claims/{id}/approve")
    @Transactional
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Claim c = claims.findById(id).orElse(null);
        if (c == null) {
            return ResponseEntity.status(404).body("Claim not found");
        }
        if (!"PENDING".equals(c.getStatus())) {
            return ResponseEntity.status(409).body("Claim is already " + c.getStatus());
        }
        Item item = items.findById(c.getItemId()).orElse(null);
        if (item == null) {
            return ResponseEntity.status(404).body("Item not found");
        }
        c.setStatus("APPROVED");
        claims.save(c);
        item.setStatus("CLAIMED");
        items.save(item);
        for (Claim other : claims.findByItemIdAndStatus(item.getId(), "PENDING")) {
            other.setStatus("REJECTED");
            claims.save(other);
        }
        return ResponseEntity.ok(view(c));
    }

    @PatchMapping("/admin/claims/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Claim c = claims.findById(id).orElse(null);
        if (c == null) {
            return ResponseEntity.status(404).body("Claim not found");
        }
        if (!"PENDING".equals(c.getStatus())) {
            return ResponseEntity.status(409).body("Claim is already " + c.getStatus());
        }
        c.setStatus("REJECTED");
        return ResponseEntity.ok(view(claims.save(c)));
    }

    @PatchMapping("/admin/items/{id}/returned")
    public ResponseEntity<?> returned(@PathVariable Long id) {
        Item item = items.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(404).body("Item not found");
        }
        if (!"CLAIMED".equals(item.getStatus())) {
            return ResponseEntity.status(409).body("Only claimed items can be marked returned");
        }
        item.setStatus("RETURNED");
        return ResponseEntity.ok(items.save(item));
    }
}