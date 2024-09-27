create database cybergame;
use cybergame;
CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT AUTO_INCREMENT,
  `username` VARCHAR(50),
  `password` VARCHAR(255),
  `email` VARCHAR(100),
  `user_type` TinyINT,
  `is_vip` TinyINT DEFAULT 0,
  `vip_start_date` DATE,
  `vip_end_date` DATE,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `room` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `room_name` VARCHAR(50),
  `status` VARCHAR(50),
  `position` VARCHAR(100),
  `image_url` VARCHAR(100),
  `capacity` INT,
  `description` VARCHAR(255)
);

CREATE TABLE `desktop` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `room_id` INT,
  `status` VARCHAR(50),
  `description` VARCHAR(100)
);

CREATE TABLE `category` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_name` VARCHAR(100),
  `description` VARCHAR(255),
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `product` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `image_url` VARCHAR(100),
  `product_name` VARCHAR(100),
  `price` DECIMAL(10,2),
  `category_id` VARCHAR(50),
  `description` VARCHAR(255),
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `cart` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `product_id` INT,
  `quanity` INT,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `order` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `total_money` DECIMAL(10,2) NOT NULL,
  `order_date` DATETIME,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `order_detail` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `room_order_detail` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT,
  `room_id` INT NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME,
  `total_time` TIME,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT NOW()
);

ALTER TABLE `cart` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `cart` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `order` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `order_detail` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `order_detail` ADD FOREIGN KEY (`order_id`) REFERENCES `order` (`id`);

ALTER TABLE `product` ADD FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);

ALTER TABLE `room_order_detail` ADD FOREIGN KEY (`order_id`) REFERENCES `order` (`id`);

ALTER TABLE `room_order_detail` ADD FOREIGN KEY (`order_id`) REFERENCES `room` (`id`);

ALTER TABLE `desktop` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`id`);

