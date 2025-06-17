-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               11.7.2-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table fieldofdreams.coach
CREATE TABLE IF NOT EXISTS `coach` (
  `coach_id` int(11) NOT NULL AUTO_INCREMENT,
  `coach_full_name` varchar(100) NOT NULL,
  `coach_email` varchar(150) NOT NULL,
  `coach_avatar` varchar(150) DEFAULT NULL,
  `coach_code` varchar(6) NOT NULL,
  `coach_salt` varchar(100) NOT NULL,
  `coach_password` varchar(255) NOT NULL,
  PRIMARY KEY (`coach_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.coach_play
CREATE TABLE IF NOT EXISTS `coach_play` (
  `cps_coach_id` int(11) NOT NULL,
  `cps_play_id` int(11) NOT NULL,
  PRIMARY KEY (`cps_coach_id`,`cps_play_id`),
  KEY `FK_cps_play` (`cps_play_id`),
  CONSTRAINT `FK_cps_coach` FOREIGN KEY (`cps_coach_id`) REFERENCES `coach` (`coach_id`),
  CONSTRAINT `FK_cps_play` FOREIGN KEY (`cps_play_id`) REFERENCES `play` (`play_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.frame
CREATE TABLE IF NOT EXISTS `frame` (
  `frame_id` int(11) NOT NULL AUTO_INCREMENT,
  `ball_x` int(11) NOT NULL,
  `ball_y` int(11) NOT NULL,
  PRIMARY KEY (`frame_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.frame_object
CREATE TABLE IF NOT EXISTS `frame_object` (
  `fos_frame_id` int(11) NOT NULL,
  `fos_object_id` int(11) NOT NULL,
  PRIMARY KEY (`fos_frame_id`,`fos_object_id`),
  KEY `FK_fos_object` (`fos_object_id`),
  CONSTRAINT `FK_fos_frame` FOREIGN KEY (`fos_frame_id`) REFERENCES `frame` (`frame_id`),
  CONSTRAINT `FK_fos_object` FOREIGN KEY (`fos_object_id`) REFERENCES `object` (`object_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.object
CREATE TABLE IF NOT EXISTS `object` (
  `object_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) DEFAULT NULL,
  `object_x` int(11) NOT NULL,
  `object_y` int(11) NOT NULL,
  `object_color` varchar(50) NOT NULL DEFAULT 'red',
  PRIMARY KEY (`object_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.play
CREATE TABLE IF NOT EXISTS `play` (
  `play_id` int(11) NOT NULL AUTO_INCREMENT,
  `play_title` varchar(50) NOT NULL,
  `play_preview` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`play_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.player
CREATE TABLE IF NOT EXISTS `player` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_full_name` varchar(100) DEFAULT NULL,
  `player_email` varchar(150) DEFAULT NULL,
  `player_avatar` varchar(150) DEFAULT NULL,
  `player_salt` varchar(100) DEFAULT NULL,
  `player_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.player_coach
CREATE TABLE IF NOT EXISTS `player_coach` (
  `pcs_player_id` int(11) NOT NULL,
  `pcs_coach_id` int(11) NOT NULL,
  PRIMARY KEY (`pcs_player_id`,`pcs_coach_id`) USING BTREE,
  KEY `FK__coach` (`pcs_coach_id`) USING BTREE,
  CONSTRAINT `FK_pcs_coach` FOREIGN KEY (`pcs_coach_id`) REFERENCES `coach` (`coach_id`),
  CONSTRAINT `FK_pcs_player` FOREIGN KEY (`pcs_player_id`) REFERENCES `player` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table fieldofdreams.play_frame
CREATE TABLE IF NOT EXISTS `play_frame` (
  `pfs_play_id` int(11) NOT NULL,
  `pfs_frame_id` int(11) NOT NULL,
  PRIMARY KEY (`pfs_play_id`,`pfs_frame_id`),
  KEY `FK__pfs_frame` (`pfs_frame_id`),
  CONSTRAINT `FK__pfs_frame` FOREIGN KEY (`pfs_frame_id`) REFERENCES `frame` (`frame_id`),
  CONSTRAINT `FK__pfs_play` FOREIGN KEY (`pfs_play_id`) REFERENCES `play` (`play_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
