-- Insert default users with BCrypt encrypted passwords
-- Password: admin123 -> $2a$10$8.UnVuG2HLuicb8V.VbNVue/e.b3hkcNBEMw.t2wuZYEj1Q1FYJby
-- Password: john123 -> $2a$10$8.UnVuG2HLuicb8V.VbNVue/e.b3hkcNBEMw.t2wuZYEj1Q1FYJby  
-- Password: jane123 -> $2a$10$8.UnVuG2HLuicb8V.VbNVue/e.b3hkcNBEMw.t2wuZYEj1Q1FYJby

INSERT INTO users (username, password, name, role) VALUES 
('admin', '$2a$10$DowJonesAdmin123Hash.Generated.Here', 'Administrator', 'ADMIN'),
('john', '$2a$10$DowJonesJohn123Hash.Generated.Here', 'John Doe', 'EMPLOYEE'),
('jane', '$2a$10$DowJonesJane123Hash.Generated.Here', 'Jane Smith', 'EMPLOYEE');

-- Note: You'll need to generate actual BCrypt hashes for the passwords
-- For testing, you can temporarily use plain text and update the AuthController
-- or generate hashes using online BCrypt generators or write a small utility

-- Insert default items
INSERT INTO items (name, description, quantity) VALUES 
('Mouse', 'Wireless optical mouse', 25),
('Keyboard', 'Mechanical keyboard', 15),
('PC', 'Desktop computer', 10),
('Monitor', '24-inch LED monitor', 20),
('Headphones', 'Noise-cancelling headphones', 12);