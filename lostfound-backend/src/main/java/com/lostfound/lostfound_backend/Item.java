package com.lostfound.lostfound_backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "items")
@Data
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private String title;
    private String category;
    private String description;
    private String color;
    private String brand;
    private String imageUrl;
    private String location;
    private LocalDateTime eventTime;
    private String status = "OPEN";
    private Long reporterId;
}