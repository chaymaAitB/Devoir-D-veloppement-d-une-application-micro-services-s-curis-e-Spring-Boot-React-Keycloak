package com.example.stock_service.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class StockMarket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "open_value", nullable = false)
    private Double openValue;

    @Column(name = "close_value", nullable = false)
    private Double closeValue;

    @Column(nullable = false)
    private Long volume;

    @Column(name = "company_id", nullable = false)
    private Long companyId;
}