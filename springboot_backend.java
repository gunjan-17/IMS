// pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.inventory</groupId>
    <artifactId>inventory-management</artifactId>
    <version>1.0.0</version>
    <name>inventory-management</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
    </dependencies>
</project>

// application.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
server.port=8080

// User.java
package com.inventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(unique = true)
    private String username;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String name;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    public enum Role {
        EMPLOYEE, ADMIN
    }
    
    // Constructors
    public User() {}
    
    public User(String username, String password, String name, Role role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

// Item.java
package com.inventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @Min(0)
    private Integer quantity;
    
    // Constructors
    public Item() {}
    
    public Item(String name, String description, Integer quantity) {
        this.name = name;
        this.description = description;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}

// Request.java
package com.inventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
    
    @Min(1)
    private Integer quantity;
    
    private String reason;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    private LocalDateTime requestDate = LocalDateTime.now();
    
    private LocalDateTime responseDate;
    
    private String adminComments;
    
    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
    
    // Constructors
    public Request() {}
    
    public Request(User user, Item item, Integer quantity, String reason) {
        this.user = user;
        this.item = item;
        this.quantity = quantity;
        this.reason = reason;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    
    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }
    
    public String getAdminComments() { return adminComments; }
    public void setAdminComments(String adminComments) { this.adminComments = adminComments; }
}

// UserRepository.java
package com.inventory.repository;

import com.inventory.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}

// ItemRepository.java
package com.inventory.repository;

import com.inventory.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}

// RequestRepository.java
package com.inventory.repository;

import com.inventory.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByUserId(Long userId);
    List<Request> findByStatus(Request.Status status);
}

// AuthController.java
package com.inventory.controller;

import com.inventory.model.User;
import com.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "name", user.getName(),
                "role", user.getRole().toString()
            ));
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid credentials"));
    }
}

// ItemController.java
package com.inventory.controller;

import com.inventory.model.Item;
import com.inventory.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:4200")
public class ItemController {
    
    @Autowired
    private ItemRepository itemRepository;
    
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        Optional<Item> item = itemRepository.findById(id);
        return item.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Item createItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            item.setName(itemDetails.getName());
            item.setDescription(itemDetails.getDescription());
            item.setQuantity(itemDetails.getQuantity());
            return ResponseEntity.ok(itemRepository.save(item));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (itemRepository.existsById(id)) {
            itemRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

// RequestController.java
package com.inventory.controller;

import com.inventory.model.Request;
import com.inventory.model.User;
import com.inventory.model.Item;
import com.inventory.repository.RequestRepository;
import com.inventory.repository.UserRepository;
import com.inventory.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:4200")
public class RequestController {
    
    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @GetMapping
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
    
    @GetMapping("/user/{userId}")
    public List<Request> getRequestsByUser(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }
    
    @PostMapping
    public ResponseEntity<Request> createRequest(@RequestBody Map<String, Object> requestData) {
        Long userId = Long.valueOf(requestData.get("userId").toString());
        Long itemId = Long.valueOf(requestData.get("itemId").toString());
        Integer quantity = Integer.valueOf(requestData.get("quantity").toString());
        String reason = requestData.get("reason").toString();
        
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        
        if (userOpt.isPresent() && itemOpt.isPresent()) {
            Request request = new Request(userOpt.get(), itemOpt.get(), quantity, reason);
            return ResponseEntity.ok(requestRepository.save(request));
        }
        
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<Request> approveRequest(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Request> requestOpt = requestRepository.findById(id);
        
        if (requestOpt.isPresent()) {
            Request request = requestOpt.get();
            request.setStatus(Request.Status.APPROVED);
            request.setResponseDate(LocalDateTime.now());
            request.setAdminComments(data.get("comments"));
            return ResponseEntity.ok(requestRepository.save(request));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<Request> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Request> requestOpt = requestRepository.findById(id);
        
        if (requestOpt.isPresent()) {
            Request request = requestOpt.get();
            request.setStatus(Request.Status.REJECTED);
            request.setResponseDate(LocalDateTime.now());
            request.setAdminComments(data.get("comments"));
            return ResponseEntity.ok(requestRepository.save(request));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Request> cancelRequest(@PathVariable Long id) {
        Optional<Request> requestOpt = requestRepository.findById(id);
        
        if (requestOpt.isPresent()) {
            Request request = requestOpt.get();
            if (request.getStatus() == Request.Status.PENDING) {
                request.setStatus(Request.Status.CANCELLED);
                request.setResponseDate(LocalDateTime.now());
                return ResponseEntity.ok(requestRepository.save(request));
            }
        }
        
        return ResponseEntity.badRequest().build();
    }
}

// DataInitializer.java
package com.inventory.config;

import com.inventory.model.User;
import com.inventory.model.Item;
import com.inventory.repository.UserRepository;
import com.inventory.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default users
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", "admin123", "Administrator", User.Role.ADMIN));
            userRepository.save(new User("john", "john123", "John Doe", User.Role.EMPLOYEE));
            userRepository.save(new User("jane", "jane123", "Jane Smith", User.Role.EMPLOYEE));
        }
        
        // Create default items
        if (itemRepository.count() == 0) {
            itemRepository.save(new Item("Mouse", "Wireless optical mouse", 25));
            itemRepository.save(new Item("Keyboard", "Mechanical keyboard", 15));
            itemRepository.save(new Item("PC", "Desktop computer", 10));
            itemRepository.save(new Item("Monitor", "24-inch LED monitor", 20));
            itemRepository.save(new Item("Headphones", "Noise-cancelling headphones", 12));
        }
    }
}

// InventoryManagementApplication.java
package com.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventoryManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryManagementApplication.class, args);
    }
}