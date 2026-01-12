package com.example.stock_service.web;

import com.example.stock_service.entities.StockMarket;
import com.example.stock_service.repository.StockMarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stockMarkets")
@RequiredArgsConstructor
public class StockMarketController {

    private final StockMarketRepository repository;

    // Get all stocks
    @GetMapping
    public List<StockMarket> getAll() {
        return repository.findAll();
    }

    // Get stocks by company ID
    @GetMapping("/company/{companyId}")
    public List<StockMarket> getByCompany(@PathVariable Long companyId) {
        return repository.findByCompanyId(companyId);
    }

    // Create new stock
    @PostMapping
    public ResponseEntity<StockMarket> createStock(@RequestBody StockMarket stock) {
        // Ensure ID is null for new record
        stock.setId(null);
        StockMarket saved = repository.save(stock);
        return ResponseEntity.ok(saved);
    }

    // Update existing stock
    @PutMapping("/{id}")
    public ResponseEntity<StockMarket> updateStock(@PathVariable Long id,
                                                   @RequestBody StockMarket stock) {
        Optional<StockMarket> existing = repository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StockMarket s = existing.get();
        s.setDate(stock.getDate());
        s.setOpenValue(stock.getOpenValue());
        s.setCloseValue(stock.getCloseValue());
        s.setVolume(stock.getVolume());
        s.setCompanyId(stock.getCompanyId());

        StockMarket updated = repository.save(s);
        return ResponseEntity.ok(updated);
    }

    // Delete a stock
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
