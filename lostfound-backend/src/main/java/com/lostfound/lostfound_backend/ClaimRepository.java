package com.lostfound.lostfound_backend;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByClaimerIdOrderByIdDesc(Long claimerId);
    List<Claim> findByStatusOrderByIdDesc(String status);
    List<Claim> findByItemIdAndStatus(Long itemId, String status);
    boolean existsByItemIdAndClaimerIdAndStatus(Long itemId, Long claimerId, String status);
}