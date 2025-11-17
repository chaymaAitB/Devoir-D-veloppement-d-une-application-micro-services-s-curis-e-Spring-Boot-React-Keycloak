package com.example.stock_service.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stockMarkets")
@RequiredArgsConstructor
public class StockMarketController {

    // Endpoint de simulation - retourne seulement un message
    @GetMapping("/company/{companyId}/price-update")
    public ResponseEntity<String> simulatePriceUpdate(@PathVariable Long companyId) {
        String message = "Fonctionnalité : Calcul et mise à jour du prix actuel de l'action avec la valeur de fermeture de la dernière cotation";
        return ResponseEntity.ok(message);
    }
}