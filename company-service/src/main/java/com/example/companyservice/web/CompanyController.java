package com.example.companyservice.web;

import com.example.companyservice.entities.Company;
import com.example.companyservice.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyRepository repository;

    public CompanyController(CompanyRepository repository) {
        this.repository = repository;
        System.out.println("✅ CompanyController initialized");
    }

    // GET all companies - UPDATED FOR DEBUGGING
    @GetMapping
    public ResponseEntity<List<Company>> getAll() {
        System.out.println("=== GET /companies called ===");
        try {
            List<Company> companies = repository.findAll();
            System.out.println("✅ Found " + companies.size() + " companies");

            // Debug each company's ID
            for (int i = 0; i < companies.size(); i++) {
                Company company = companies.get(i);
                System.out.println("Company " + i + ":");
                System.out.println("   - ID: " + company.getId());
                System.out.println("   - Name: " + company.getName());
                System.out.println("   - Sector: " + company.getSector());
                System.out.println("   - Country: " + company.getCountry());
                System.out.println("   - toString(): " + company.toString());
            }

            return ResponseEntity.ok(companies);
        } catch (Exception e) {
            System.err.println("❌ ERROR in GET /companies:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET by ID - accept String to handle "undefined"
    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable String id) {
        System.out.println("=== GET /companies/" + id + " called ===");
        try {
            // Validate ID
            if (id == null || id.equalsIgnoreCase("undefined") || id.equalsIgnoreCase("null")) {
                return ResponseEntity.badRequest().build();
            }

            Long companyId;
            try {
                companyId = Long.parseLong(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().build();
            }

            return repository.findById(companyId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST create new company - UPDATED WITH BETTER LOGGING
    @PostMapping
    public ResponseEntity<Company> create(@RequestBody Company company) {
        System.out.println("=== POST /companies called ===");
        System.out.println("📝 Request body received: " + company);
        System.out.println("📝 Company ID before save: " + company.getId());
        System.out.println("📝 Company name: " + company.getName());

        try {
            // Validate
            if (company.getName() == null || company.getName().trim().isEmpty()) {
                System.out.println("❌ Validation failed: Name is empty");
                return ResponseEntity.badRequest().build();
            }

            // Check if company with same name already exists
            if (repository.existsByName(company.getName())) {
                System.out.println("❌ Company with name '" + company.getName() + "' already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            // Save the company
            System.out.println("💾 Saving company to database...");
            Company saved = repository.save(company);
            System.out.println("✅ Company saved successfully!");
            System.out.println("📝 Company ID after save: " + saved.getId());
            System.out.println("📝 Full saved company object: " + saved);

            // Debug: Fetch it again to confirm
            if (saved.getId() != null) {
                Optional<Company> fetched = repository.findById(saved.getId());
                if (fetched.isPresent()) {
                    System.out.println("🔍 Fetched from DB - ID: " + fetched.get().getId() +
                            ", Name: " + fetched.get().getName());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            System.err.println("❌ ERROR in POST /companies:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT update company - accept String ID to handle "undefined"
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Company> update(@PathVariable String id, @RequestBody Company updatedCompany) {
        System.out.println("=== PUT /companies/" + id + " called ===");
        System.out.println("📝 Request body: " + updatedCompany);

        try {
            // Validate ID
            if (id == null || id.equalsIgnoreCase("undefined") || id.equalsIgnoreCase("null")) {
                System.out.println("❌ Invalid ID: " + id);
                return ResponseEntity.badRequest().build();
            }

            Long companyId;
            try {
                companyId = Long.parseLong(id);
            } catch (NumberFormatException e) {
                System.out.println("❌ ID is not a number: " + id);
                return ResponseEntity.badRequest().build();
            }

            // 1. Find the existing company
            Company existingCompany = repository.findById(companyId)
                    .orElseThrow(() -> {
                        System.out.println("❌ Company not found with ID: " + companyId);
                        return new RuntimeException("Company not found with ID: " + companyId);
                    });

            System.out.println("🔍 Found existing company: " + existingCompany);

            // 2. Check if name is being changed and if new name already exists
            String newName = updatedCompany.getName();
            if (newName != null && !newName.trim().isEmpty()) {
                // If name is being changed
                if (!existingCompany.getName().equals(newName.trim())) {
                    // Check if another company already has this name
                    if (repository.existsByName(newName.trim())) {
                        System.out.println("❌ Another company already has name: " + newName.trim());
                        return ResponseEntity.status(HttpStatus.CONFLICT).build();
                    }
                    existingCompany.setName(newName.trim());
                }
            }

            // 3. Update other fields
            if (updatedCompany.getSector() != null) {
                existingCompany.setSector(updatedCompany.getSector().trim());
            }

            if (updatedCompany.getCountry() != null) {
                existingCompany.setCountry(updatedCompany.getCountry().trim());
            }

            System.out.println("🔄 Updated company: " + existingCompany);

            // 4. Save
            Company savedCompany = repository.save(existingCompany);
            System.out.println("✅ Company updated successfully");
            return ResponseEntity.ok(savedCompany);

        } catch (Exception e) {
            System.err.println("❌ ERROR in PUT /companies/" + id + ":");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE company - accept String ID to handle "undefined"
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> delete(@PathVariable String id) {
        System.out.println("=== DELETE /companies/" + id + " called ===");

        try {
            // Validate ID
            if (id == null || id.equalsIgnoreCase("undefined") || id.equalsIgnoreCase("null")) {
                System.out.println("❌ Invalid ID: " + id);
                return ResponseEntity.badRequest().body("Invalid company ID");
            }

            // Convert to Long
            Long companyId;
            try {
                companyId = Long.parseLong(id);
            } catch (NumberFormatException e) {
                System.out.println("❌ ID is not a number: " + id);
                return ResponseEntity.badRequest().body("Company ID must be a number");
            }

            // First check if company exists
            if (!repository.existsById(companyId)) {
                System.out.println("❌ Company not found with ID: " + companyId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Company not found with ID: " + companyId);
            }

            System.out.println("🗑️ Deleting company with ID: " + companyId);

            // Try to delete
            repository.deleteById(companyId);

            System.out.println("✅ Company deleted successfully");
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            System.err.println("❌ ERROR in DELETE /companies/" + id + ":");
            e.printStackTrace();

            // Return a simple string message
            String errorMessage = "Failed to delete company";

            // Check for foreign key constraint violation
            Throwable cause = e;
            while (cause != null) {
                if (cause.getMessage() != null &&
                        (cause.getMessage().contains("foreign key") ||
                                cause.getMessage().contains("constraint") ||
                                cause.getMessage().contains("referenced"))) {
                    errorMessage = "Cannot delete company: It is referenced by other records";
                    break;
                }
                cause = cause.getCause();
            }

            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
        }


    }

    // Add test data endpoint

}