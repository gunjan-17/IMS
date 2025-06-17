CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- For MySQL / H2
    -- id BIGSERIAL PRIMARY KEY,           -- For PostgreSQL alternative

    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('EMPLOYEE', 'ADMIN')) NOT NULL
);

CREATE TABLE items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- Use BIGSERIAL for PostgreSQL

    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT CHECK (quantity >= 0)
);
CREATE TABLE requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- Use BIGSERIAL for PostgreSQL

    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,

    quantity INT CHECK (quantity >= 1),
    reason TEXT,

    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),

    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP,

    admin_comments TEXT,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
