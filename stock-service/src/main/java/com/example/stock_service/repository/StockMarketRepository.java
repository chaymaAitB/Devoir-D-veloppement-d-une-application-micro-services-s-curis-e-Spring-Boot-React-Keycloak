package com.example.stock_service.repository;

import com.example.stock_service.entities.StockMarket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface StockMarketRepository extends JpaRepository<StockMarket, Long> {
}
