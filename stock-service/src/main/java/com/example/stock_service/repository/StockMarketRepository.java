package com.example.stock_service.repository;

import com.example.stock_service.entities.StockMarket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.LocalDate;
import java.util.List;

@RepositoryRestResource
public interface StockMarketRepository extends JpaRepository<StockMarket, Long> {
    List<StockMarket> findByCompanyId(Long companyId);

    List<StockMarket> findByCompanyIdAndDateBetween(
            Long companyId, LocalDate start, LocalDate end);
}
