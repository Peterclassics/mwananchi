CREATE TABLE users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL UNIQUE,
 phone VARCHAR(25) NULL,
 password_hash VARCHAR(255) NOT NULL,
 role ENUM('citizen','admin') NOT NULL DEFAULT 'citizen',
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
CREATE TABLE categories (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE,
 description VARCHAR(255) NOT NULL,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE service_requests (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 reference_number VARCHAR(40) NOT NULL UNIQUE,
 citizen_id INT UNSIGNED NOT NULL,
 category_id INT UNSIGNED NOT NULL,
 county VARCHAR(100) NOT NULL,
 town_or_area VARCHAR(100) NOT NULL,
 location_details VARCHAR(255) NOT NULL,
 description TEXT NOT NULL,
 image_storage_key VARCHAR(64) NULL,
 status ENUM('pending','in_progress','resolved') NOT NULL DEFAULT 'pending',
 version INT UNSIGNED NOT NULL DEFAULT 1,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 resolved_at TIMESTAMP(3) NULL,
 FOREIGN KEY (citizen_id) REFERENCES users(id),
 FOREIGN KEY (category_id) REFERENCES categories(id),
 INDEX idx_owner_date(citizen_id,created_at),
 INDEX idx_status_date(status,created_at),
 INDEX idx_category_date(category_id,created_at),
 INDEX idx_created(created_at),
 CONSTRAINT description_length CHECK (CHAR_LENGTH(description) BETWEEN 20 AND 2000),
 CONSTRAINT resolution_date CHECK ((status='resolved' AND resolved_at IS NOT NULL) OR (status<>'resolved' AND resolved_at IS NULL))
);
CREATE TABLE request_updates (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 request_id INT UNSIGNED NOT NULL,
 actor_id INT UNSIGNED NOT NULL,
 event_type ENUM('created','status_changed','comment') NOT NULL,
 previous_status ENUM('pending','in_progress','resolved') NULL,
 new_status ENUM('pending','in_progress','resolved') NULL,
 note TEXT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (request_id) REFERENCES service_requests(id),
 FOREIGN KEY (actor_id) REFERENCES users(id),
 INDEX idx_request_time(request_id,created_at)
);
