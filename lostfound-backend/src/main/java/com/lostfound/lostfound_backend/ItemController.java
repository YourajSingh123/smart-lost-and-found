package com.lostfound.lostfound_backend;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemRepository repo;

    @PostMapping
    public Item create(@RequestBody Item item) {
        return repo.save(item);
    }

    @GetMapping
    public List<Item> list(@RequestParam(required = false) String type) {
        if (type == null) {
            return repo.findAll();
        }
        return repo.findByType(type.toUpperCase());
    }
}