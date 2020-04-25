-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: photolab
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `accounts` (
  `ph_id` int NOT NULL,
  `account_link` varchar(255) NOT NULL,
  `social_id` int NOT NULL,
  PRIMARY KEY (`ph_id`,`social_id`),
  KEY `social_id_idx` (`social_id`),
  CONSTRAINT `account_owner` FOREIGN KEY (`ph_id`) REFERENCES `photographers` (`ph_id`),
  CONSTRAINT `social_id` FOREIGN KEY (`social_id`) REFERENCES `socialnetworks` (`social_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'https://www.instagram.com/gingermias_ph/',3),(1,'https://unsplash.com/@gingermias',10),(1,'https://www.pinterest.ru/loavathein/',11),(2,'https://www.instagram.com/gingermias/',3);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ph_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fav_user_idx` (`user_id`),
  KEY `fav_ph_idx` (`ph_id`),
  CONSTRAINT `fav_ph` FOREIGN KEY (`ph_id`) REFERENCES `photographers` (`ph_id`),
  CONSTRAINT `fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `folders` (
  `folder_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `ph_id` int NOT NULL,
  PRIMARY KEY (`folder_id`),
  KEY `folder_owner_idx` (`ph_id`),
  CONSTRAINT `folder_owner` FOREIGN KEY (`ph_id`) REFERENCES `photographers` (`ph_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folders`
--

LOCK TABLES `folders` WRITE;
/*!40000 ALTER TABLE `folders` DISABLE KEYS */;
INSERT INTO `folders` VALUES (1,'Portraits',1),(2,'Velver Dynasty',1),(3,'Animals',1),(4,'Boys',2),(5,'Girls',2);
/*!40000 ALTER TABLE `folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photographers`
--

DROP TABLE IF EXISTS `photographers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `photographers` (
  `ph_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `lastname` varchar(45) NOT NULL,
  `firstname` varchar(45) NOT NULL,
  `fathername` varchar(45) DEFAULT NULL,
  `price` double NOT NULL,
  `exp` double NOT NULL,
  `organization` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`ph_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `userph` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photographers`
--

LOCK TABLES `photographers` WRITE;
/*!40000 ALTER TABLE `photographers` DISABLE KEYS */;
INSERT INTO `photographers` VALUES (1,1,'Андрусів','Соломія','Ігорівна',200,4,NULL),(2,2,'Кірдяєва','Ольга','Олександрівна',250,3,'Фотостудія \"Inlight\"');
/*!40000 ALTER TABLE `photographers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `photos` (
  `photo_id` int NOT NULL AUTO_INCREMENT,
  `link` varchar(255) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `folder_id` int NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `folder_id_idx` (`folder_id`),
  CONSTRAINT `folder_id` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`folder_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,'https://images.unsplash.com/photo-1573679830888-ca39dde5f948?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60','Wuthering Heights','girl hat nature field',1),(2,'https://images.unsplash.com/photo-1570561699059-7e70dd27e21b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80',NULL,'girl sand street water kyiv',1),(3,'https://images.unsplash.com/photo-1568272975370-b59d3950ac2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80','Little Red Dress','fashion lookbook modern dirl heels',1),(4,'https://images.unsplash.com/photo-1573679897701-8e9300b831ee?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80','Harmony','girl sitting lookbook smiling darkhair nature',1),(5,'https://images.unsplash.com/photo-1574264704597-8a9c2833dbf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80','Queen of Earth','girl queen dress crown',1),(6,'https://i.pinimg.com/564x/36/fc/81/36fc8141638d47c6db9d574561ef41cc.jpg',NULL,'hand jewelry white crema greece statue chanel',2),(7,'https://i.pinimg.com/564x/1a/ef/a4/1aefa49d62663a1317a41a34fd7b17f1.jpg',NULL,'crema books instagram inspiration',2),(8,'https://i.pinimg.com/564x/10/9b/cb/109bcbbd1a85a2d515f15a35295bc52e.jpg','Vogue','vogue wall painting magazine pantone fashion',2),(9,'https://i.pinimg.com/564x/6c/05/de/6c05defc339529c85a74b4accdeaa5cd.jpg',NULL,'mirror jewelry short hair girl',2),(10,'https://i.pinimg.com/564x/24/d4/24/24d4246c730bc718420c2f8d17207885.jpg','Flowers on the Wall','painting sunset flowers roses crema',2),(11,'https://i.pinimg.com/564x/14/00/5a/14005acae29b79433388e4eb65da67a8.jpg',NULL,'boy red smoking',4),(12,'https://i.pinimg.com/564x/4c/b8/de/4cb8de331a8af5649017a285a3ea7648.jpg','Honey Bunny','playboy boy red bunny ears',4),(14,'https://i.pinimg.com/564x/1c/c3/c2/1cc3c2c391c6eba2b34314cbdf13aa7d.jpg','Tropical Crema','floor leaf girl heels tropical',5),(15,'https://i.pinimg.com/564x/29/15/67/2915677f9c827b7f2616fa7e54b4c7a6.jpg','Blind Flower','girl flowers portrait jewelry',5),(16,'https://i.pinimg.com/564x/3b/89/d4/3b89d4bcee6aa47454c66d2fe1f1be75.jpg','Greece Muse','greece statue shirt man clothes artist',5),(17,'https://i.pinimg.com/564x/11/81/39/11813910c2a49e01831e337ec6fe5c4d.jpg','Apple Garden','girl apples nature chair garden fashion',5),(18,'https://i.pinimg.com/564x/72/16/0e/72160e518195111baf88aee5798d0753.jpg','Sweet Grapes','girl grapes portrait blue eyes',5),(19,'https://i.pinimg.com/474x/57/99/64/579964f4d3809e44d57f3ca5764eea54.jpg','Peachy Colors','ginger hedhair apricot portrait girl jewelry',5);
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ph_id` int NOT NULL,
  `user_id` int NOT NULL,
  `mark` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rate_user_idx` (`user_id`),
  KEY `rate_ph_idx` (`ph_id`),
  CONSTRAINT `rate_ph` FOREIGN KEY (`ph_id`) REFERENCES `photographers` (`ph_id`),
  CONSTRAINT `rate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'client'),(2,'photographer'),(3,'admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoots`
--

DROP TABLE IF EXISTS `shoots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `shoots` (
  `ph_id` int NOT NULL,
  `type_id` int NOT NULL,
  PRIMARY KEY (`type_id`,`ph_id`),
  KEY `shoot_maker_idx` (`ph_id`),
  CONSTRAINT `shoot_maker` FOREIGN KEY (`ph_id`) REFERENCES `photographers` (`ph_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `type_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoots`
--

LOCK TABLES `shoots` WRITE;
/*!40000 ALTER TABLE `shoots` DISABLE KEYS */;
INSERT INTO `shoots` VALUES (1,1),(1,2),(1,4),(1,8),(2,1),(2,5),(2,6),(2,8),(2,10),(2,11);
/*!40000 ALTER TABLE `shoots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialnetworks`
--

DROP TABLE IF EXISTS `socialnetworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `socialnetworks` (
  `social_id` int NOT NULL AUTO_INCREMENT,
  `site_name` varchar(45) NOT NULL,
  `icon` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`social_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialnetworks`
--

LOCK TABLES `socialnetworks` WRITE;
/*!40000 ALTER TABLE `socialnetworks` DISABLE KEYS */;
INSERT INTO `socialnetworks` VALUES (1,'Telegram',NULL),(2,'Viber',NULL),(3,'Instagram',NULL),(4,'Facebook',NULL),(5,'Vk',NULL),(6,'Twitter',NULL),(7,'Tumblr',NULL),(8,'Olx',NULL),(9,'Flickr',NULL),(10,'Unsplash',NULL),(11,'Pinterest',NULL),(12,'Власний сайт',NULL);
/*!40000 ALTER TABLE `socialnetworks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types`
--

DROP TABLE IF EXISTS `types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types`
--

LOCK TABLES `types` WRITE;
/*!40000 ALTER TABLE `types` DISABLE KEYS */;
INSERT INTO `types` VALUES (1,'Портретна зйомка'),(2,'Предметна зйомка'),(3,'Весільна зйомка'),(4,'Студійна зйомка'),(5,'Сімейна зйомка'),(6,'Святкова зйомка'),(7,'Відеозйомка'),(8,'Зйомка на плівку'),(9,'Love story'),(10,'Модельні тести'),(11,'Тфп');
/*!40000 ALTER TABLE `types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_login` varchar(45) NOT NULL,
  `user_pass` varchar(70) NOT NULL,
  `avatar_link` varchar(255) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_login_UNIQUE` (`user_login`),
  KEY `role_idx` (`role_id`),
  CONSTRAINT `role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'solja','49c245837dab915e32626431579a019e90c471a2d0ed8fd638afb063630bbb42','https://i.pinimg.com/564x/4b/2d/6f/4b2d6f4f2ffbcead905dd3958a1fc48f.jpg','Київ','gingermias',2),(2,'olja','49c245837dab915e32626431579a019e90c471a2d0ed8fd638afb063630bbb42','https://i.pinimg.com/564x/85/1d/9c/851d9cc68522e46f9a2b019fcb4c27a2.jpg','Київ','o.kirdiaieva',2);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-25 14:40:22
