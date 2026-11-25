package com.lostfound.lostfound_backend;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByType(String type);
    List<Item> findByReporterIdOrderByIdDesc(Long reporterId);
}