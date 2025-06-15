package com.inventory.config;

import com.inventory.model.User;
import com.inventory.model.Item;
import com.inventory.repository.UserRepository;
import com.inventory.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default users with encoded passwords
        if (userRepository.count() == 0) {
            userRepository.save(new User(
                "admin", 
                passwordEncoder.encode("admin123"), 
                "Administrator", 
                User.Role.ADMIN
            ));
            userRepository.save(new User(
                "john", 
                passwordEncoder.encode("john123"), 
                "John Doe", 
                User.Role.EMPLOYEE
            ));
            userRepository.save(new User(
                "jane", 
                passwordEncoder.encode("jane123"), 
                "Jane Smith", 
                User.Role.EMPLOYEE
            ));
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