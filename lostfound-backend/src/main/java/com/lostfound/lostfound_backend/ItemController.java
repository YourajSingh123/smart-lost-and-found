package com.lostfound.lostfound_backend;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItemController {

    private final ItemRepository repo;
    private final UserRepository users;

    @PostMapping("/items")
    public ResponseEntity<?> create(@RequestBody Item item, Authentication auth) {
        var me = users.findByEmail(auth.getName());
        if (me.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }
        item.setId(null);
        item.setStatus("OPEN");
        item.setReporterId(me.get().getId());
        return ResponseEntity.ok(repo.save(item));
    }

    @GetMapping("/items")
    public List<Item> list(@RequestParam(required = false) String type) {
        if (type == null) {
            return repo.findAll();
        }
        return repo.findByType(type.toUpperCase());
    }

    @GetMapping("/my/items")
    public ResponseEntity<?> mine(Authentication auth) {
        var me = users.findByEmail(auth.getName());
        if (me.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }
        return ResponseEntity.ok(repo.findByReporterIdOrderByIdDesc(me.get().getId()));
    }
}