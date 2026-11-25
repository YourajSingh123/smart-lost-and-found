package com.lostfound.lostfound_backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "claims")
@Data
public class Claim {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long itemId;
    private Long claimerId;
    private String message;
    private String status = "PENDING";

    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;
}